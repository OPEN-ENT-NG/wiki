import { EmptyScreen, Heading } from '@edifice-ui/react';

import emptyScreenImage from '~/assets/illu-wiki.svg';

export const WikiEmptyScreen = () => {
  const emptyStyles = { maxWidth: '424px', margin: '0 auto' };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={emptyStyles}
    >
      <EmptyScreen imageSrc={emptyScreenImage} />
      <Heading className="text-secondary mb-16">
        Créez une première page
      </Heading>
      <p className="text-center">
        Votre première page peut être une introduction ou bien un récapitulatif
        de votre contenu
      </p>
    </div>
  );
};
