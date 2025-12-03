import { Button, Card, Flex, useEdificeClient } from '@edifice.io/react';
import { IconThumbDown, IconThumbUp } from '@edifice.io/react/icons';
import { PollVote } from '~/services/api/poll/poll.types';
import importIcon from '../icons/importIcon.svg';
import {
  IMPORT_PDF_POLL_ID,
  pollService,
} from '~/services/api/poll/poll.service';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export const PagesAssistantImportPollCard = () => {
  const [importPdfPollVote, setImportPdfPollVote] = useState(
    pollService.getPollVote(IMPORT_PDF_POLL_ID),
  );
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  /**
   * Call the poll service to submit a vote for the Import PDF feature poll.
   * @param answer Import PDF feature poll answer
   */
  const submitPollVote = async (vote: PollVote) => {
    console.log('poll answer', vote);
    await pollService.submitPollVote(IMPORT_PDF_POLL_ID, {
      vote,
    });
    setImportPdfPollVote(vote);
  };

  /**
   * Handle click on "Yes" button for Import PDF feature poll
   */
  const handleImportYesButtonClick = () => {
    submitPollVote(PollVote.YES);
  };

  /**
   * Handle click on "No" button for Import PDF feature poll
   */
  const handleImportNoButtonClick = () => {
    submitPollVote(PollVote.NO);
  };

  return (
    <Card
      isSelectable={false}
      isClickable={false}
      className="card-import h-full"
    >
      <Card.Body>
        <Card.Image imageSrc={importIcon} />
        <div className="text-truncate">
          <Card.Title>
            <p>{t('wiki.assistant.card.import.title', { ns: appCode })}</p>
          </Card.Title>
          <Card.Text className="white-space-normal">
            {t('wiki.assistant.card.import.description', {
              ns: appCode,
            })}
          </Card.Text>
        </div>
      </Card.Body>
      <Card.Footer>
        <Flex gap="12">
          <Button
            className={clsx('btn-thumb-up', {
              selected: importPdfPollVote === PollVote.YES,
            })}
            color="tertiary"
            variant="ghost"
            size="sm"
            leftIcon={<IconThumbUp />}
            onClick={handleImportYesButtonClick}
          >
            {t('wiki.assistant.card.import.button.yes', {
              ns: appCode,
            })}
          </Button>
          <Button
            className={clsx('btn-thumb-down', {
              selected: importPdfPollVote === PollVote.NO,
            })}
            color="tertiary"
            variant="ghost"
            size="sm"
            leftIcon={<IconThumbDown />}
            onClick={handleImportNoButtonClick}
          >
            {t('wiki.assistant.card.import.button.no', {
              ns: appCode,
            })}
          </Button>
        </Flex>
      </Card.Footer>
    </Card>
  );
};
