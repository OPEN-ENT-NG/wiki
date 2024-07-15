import { ActionFunctionArgs, Form, redirect } from 'react-router-dom';
import { wikiService } from '~/services';

export async function action({ params }: ActionFunctionArgs) {
  const content = 'test';

  const data = await wikiService.createPage({
    wikiId: params.wikiId!,
    data: {
      title: "page d'accueil",
      content,
    },
  });

  return redirect(`/id/${params.wikiId}/page/${params}/${data._id}`);
}

export const CreatePage = () => {
  return (
    <Form method="post">
      <h1>Création d'une page</h1>
      <button type="submit">Créer une page</button>
    </Form>
  );
};
