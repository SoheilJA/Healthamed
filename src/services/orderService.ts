import type { Order, Pharmacy, Prescription } from "@/types";
import { delay, getDb, persist, requireOnline, uid } from "./db";
import { buildOfflineSnapshot } from "./syncService";
import { saveSnapshot } from "@/lib/offline";

/** Demo realism: order status advances with elapsed time. */
function withComputedStatus(o: Order): Order {
  if (o.status === "cancelled" || o.status === "delivered") return o;
  const age = Date.now() - o.createdAt;
  const flow: Order["status"][] = [
    "registered",
    "preparing",
    "shipped",
    "delivered",
  ];
  const thresholds = [0, 2 * 60_000, 5 * 60_000, 10 * 60_000];
  let status: Order["status"] = "registered";
  for (let i = flow.length - 1; i >= 0; i--) {
    if (age >= thresholds[i]) {
      status = flow[i];
      break;
    }
  }
  if (status !== o.status) {
    o.status = status;
    const db = getDb();
    if (!o.timeline.some((t) => t.status === status))
      o.timeline.push({ status, at: Date.now() });
    if (status === "delivered") {
      const rx = db.prescriptions.find((p) => p.id === o.prescriptionId);
      if (rx) rx.status = "delivered";
      db.notifications.push({
        id: uid("n"),
        userId: o.patientId,
        title: "سفارش تحویل شد",
        body: `سفارش ${o.code} تحویل داده شد.`,
        at: Date.now(),
        read: false,
        kind: "order",
      });
    }
    persist();
  }
  return o;
}

export const orderService = {
  async listPharmacies(): Promise<Pharmacy[]> {
    await delay(250);
    return getDb().pharmacies.filter((p) => p.active);
  },

  async checkAvailability(prescriptionId: string, pharmacyId: string) {
    await delay(400);
    const db = getDb();
    const rx = db.prescriptions.find((p) => p.id === prescriptionId);
    const pharmacy = db.pharmacies.find((p) => p.id === pharmacyId);
    if (!rx || !pharmacy) throw new Error("نسخه یا داروخانه یافت نشد.");
    const items = rx.drugs.map((d) => {
      const inv = pharmacy.inventory[d.drugId ?? ""];
      const available = (inv?.stock ?? 0) >= d.quantity;
      return {
        drugId: d.drugId ?? "",
        name: d.name,
        quantity: d.quantity,
        unitPrice: inv?.price ?? 10_000,
        available,
      };
    });
    return {
      items,
      pharmacy,
      subtotal: items.reduce((s, it) => s + it.unitPrice * it.quantity, 0),
    };
  },

  async createOrder(input: {
    prescriptionId: string;
    patientId: string;
    pharmacyId: string;
    type: "delivery" | "pickup";
    address?: { name: string; phone: string; address: string };
  }) {
    requireOnline();
    await delay(700);
    const db = getDb();
    const avail = await this.checkAvailability(
      input.prescriptionId,
      input.pharmacyId,
    );
    const pharmacy = db.pharmacies.find((p) => p.id === input.pharmacyId)!;
    const items = avail.items.filter((i) => i.available);
    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const deliveryFee = input.type === "pickup" ? 0 : pharmacy.deliveryFee;
    const order: Order = {
      id: uid("o"),
      code: `ORD-${randNum()}`,
      prescriptionId: input.prescriptionId,
      patientId: input.patientId,
      pharmacyId: input.pharmacyId,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      type: input.type,
      address: input.type === "delivery" ? input.address : undefined,
      status: "registered",
      createdAt: Date.now(),
      timeline: [{ status: "registered", at: Date.now() }],
    };
    db.orders.push(order);
    const rx = db.prescriptions.find((p) => p.id === input.prescriptionId);
    if (rx) rx.status = "ordered";
    db.notifications.push({
      id: uid("n"),
      userId: input.patientId,
      title: "سفارش ثبت شد",
      body: `سفارش ${order.code} با موفقیت ثبت شد.`,
      at: Date.now(),
      read: false,
      kind: "order",
    });
    persist();
    const snapshot = await buildOfflineSnapshot(input.patientId);
    await saveSnapshot(snapshot);
    return order;
  },

  async listForPatient(patientId: string) {
    await delay(250);
    const db = getDb();
    return db.orders
      .filter((o) => o.patientId === patientId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((o) => ({
        ...withComputedStatus(o),
        pharmacyName:
          db.pharmacies.find((p) => p.id === o.pharmacyId)?.name ?? "",
      }));
  },

  async get(orderId: string) {
    await delay(250);
    const db = getDb();
    const o = db.orders.find((x) => x.id === orderId);
    if (!o) throw new Error("سفارش یافت نشد.");
    return {
      ...withComputedStatus(o),
      pharmacyName:
        db.pharmacies.find((p) => p.id === o.pharmacyId)?.name ?? "",
    };
  },

  // -------- Admin --------
  async listAll(params: {
    status?: string;
    search?: string;
    page: number;
    pageSize: number;
  }) {
    await delay(250);
    const db = getDb();
    let rows = db.orders.map((o) => ({
      ...o,
      pharmacyName:
        db.pharmacies.find((p) => p.id === o.pharmacyId)?.name ?? "",
      patientName: db.users.find((u) => u.id === o.patientId)?.name ?? "",
    }));
    if (params.status) rows = rows.filter((r) => r.status === params.status);
    if (params.search?.trim())
      rows = rows.filter(
        (r) =>
          r.code.includes(params.search!.trim()) ||
          r.patientName.includes(params.search!.trim()),
      );
    rows.sort((a, b) => b.createdAt - a.createdAt);
    const start = (params.page - 1) * params.pageSize;
    return {
      items: rows.slice(start, start + params.pageSize),
      total: rows.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },

  async setStatus(orderId: string, status: Order["status"], actorName: string) {
    await delay(300);
    const db = getDb();
    const o = db.orders.find((x) => x.id === orderId);
    if (o) {
      o.status = status;
      o.timeline.push({ status, at: Date.now() });
      db.notifications.push({
        id: uid("n"),
        userId: o.patientId,
        title: "به‌روزرسانی سفارش",
        body: `وضعیت سفارش ${o.code} تغییر کرد.`,
        at: Date.now(),
        read: false,
        kind: "order",
      });
    }
    db.auditLog.unshift({
      id: uid("audit"),
      actorName,
      actorRole: "مدیر",
      action: "تغییر وضعیت سفارش",
      target: o?.code ?? orderId,
      at: Date.now(),
    });
    persist();
  },
};

function randNum() {
  return Math.floor(10000 + Math.random() * 89999);
}
