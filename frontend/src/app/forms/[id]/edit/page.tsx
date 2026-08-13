import { FormBuilder } from "@/components/builder/FormBuilder";

export default async function EditFormPage({ params }: PageProps<"/forms/[id]/edit">) {
  const { id } = await params;
  return <FormBuilder formId={id} />;
}
