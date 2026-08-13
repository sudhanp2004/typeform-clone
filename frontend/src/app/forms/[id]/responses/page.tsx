import { ResponsesView } from "@/components/results/ResponsesView";

export default async function ResponsesPage({ params }: PageProps<"/forms/[id]/responses">) {
  const { id } = await params;
  return <ResponsesView formId={id} />;
}
