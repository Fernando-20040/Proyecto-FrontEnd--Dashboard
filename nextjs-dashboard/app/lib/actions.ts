// ✅ app/lib/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* ============================
   🧩 Tipado de validación y estado
============================ */
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

/* ============================
   🧩 Validación con Zod
============================ */
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Por favor selecciona un cliente.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "El monto debe ser mayor a $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Selecciona un estado válido.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

/* ============================
   🧾 Crear factura
============================ */
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos o datos inválidos.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(`${process.env.API_POSTGRES}/facturas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amountInCents,
        status,
        date,
      }),
    });

    if (!res.ok) {
      return { message: "Error al guardar la factura en el servidor." };
    }
  } catch (error) {
    console.error("❌ Error en createInvoice:", error);
    return { message: "Error de conexión con el servidor." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

/* ============================
   🧩 Actualizar factura
============================ */
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos o datos inválidos.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    const res = await fetch(`${process.env.API_POSTGRES}/facturas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amountInCents,
        status,
      }),
    });

    if (!res.ok) {
      return { message: "Error al actualizar la factura en el servidor." };
    }
  } catch (error) {
    console.error("❌ Error en updateInvoice:", error);
    return { message: "Error de conexión con el servidor." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

/* ============================
   🗑️ Eliminar factura
============================ */
export async function deleteInvoice(id: string) {
  try {
    const res = await fetch(`${process.env.API_POSTGRES}/facturas/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Error eliminando factura: ${res.statusText}`);
    }

    revalidatePath("/dashboard/invoices");
  } catch (error) {
    console.error("❌ Error en deleteInvoice:", error);
    throw new Error("No se pudo eliminar la factura.");
  }
}
