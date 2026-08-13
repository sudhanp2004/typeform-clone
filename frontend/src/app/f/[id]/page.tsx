import { PublicFormRunner } from "@/components/respondent/PublicFormRunner";

export default async function PublicFormPage({ params }: PageProps<"/f/[id]">) {
  const { id } = await params;
  return <PublicFormRunner formId={id} />;
}
