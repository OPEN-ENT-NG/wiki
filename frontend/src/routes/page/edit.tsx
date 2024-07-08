import { ActionFunctionArgs, Form, redirect } from 'react-router-dom';
import { wikiService } from '~/services/api';

export async function action({ params }: ActionFunctionArgs) {
  const content = 'test';

  await wikiService.updatePage({
    wikiId: params.wikiId!,
    pageId: params.pageId!,
    data: {
      title: 'page mise à jour',
      content,
    },
  });

  return redirect(`/id/${params.wikiId}/page/${params.pageId!}`);
}

export const EditPage = () => {
  return (
    <Form method="put">
      <h1>Edition d'une page</h1>
      <button type="submit">Editer une page</button>
    </Form>
  );
};
