import {
  Button,
  PromotionCard,
  useEdificeClient,
  useToast,
  useUser,
} from '@edifice.io/react';
import {
  IconThumbDown,
  IconThumbUp,
  IconUpload,
} from '@edifice.io/react/icons';
import { PollVoteResult } from '~/services/api/poll/poll.types';
import {
  IMPORT_PDF_POLL_ID,
  pollService,
} from '~/services/api/poll/poll.service';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useGetPoll } from '~/services/queries/poll/poll.query';

export const PagesAssistantImportPollCard = () => {
  const [importPdfPollVote, setImportPdfPollVote] = useState<
    PollVoteResult | undefined
  >(undefined);

  const { data: poll } = useGetPoll(IMPORT_PDF_POLL_ID);
  const { user } = useUser();
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const toast = useToast();

  // Set the user's vote for the Import PDF poll on component mount and when the poll data changes
  useEffect(() => {
    const vote = poll?.votes?.find(
      (vote) => vote.userId === user?.userId,
    )?.vote;
    setImportPdfPollVote((prev) => (prev === vote ? prev : vote));
  }, [poll, user]);

  /**
   * Call the poll service to submit a vote for the Import PDF feature poll.
   * @param answer Import PDF feature poll answer
   */
  const submitPollVote = async (vote: PollVoteResult) => {
    await pollService.submitPollVote(IMPORT_PDF_POLL_ID, {
      vote,
    });
    toast.success(
      t('wiki.assistant.card.import.voteRecorded', { ns: appCode }),
    );
    setImportPdfPollVote(vote);
  };

  /**
   * Handle click on "Yes" button for Import PDF feature poll
   */
  const handleImportYesButtonClick = () => {
    submitPollVote(PollVoteResult.YES);
  };

  /**
   * Handle click on "No" button for Import PDF feature poll
   */
  const handleImportNoButtonClick = () => {
    submitPollVote(PollVoteResult.NO);
  };

  return (
    <PromotionCard backgroundColor="#F2F2F2">
      <PromotionCard.Icon
        backgroundColor="#FFF"
        icon={<IconUpload color="#B0B0B0" />}
      />
      <PromotionCard.Body>
        <PromotionCard.Title>
          {t('wiki.assistant.card.import.title', { ns: appCode })}
        </PromotionCard.Title>
        <PromotionCard.Description>
          {t('wiki.assistant.card.import.description', {
            ns: appCode,
          })}
        </PromotionCard.Description>
      </PromotionCard.Body>
      <PromotionCard.Footer>
        <Button
          className={clsx('btn-thumb-up', {
            selected: importPdfPollVote === PollVoteResult.YES,
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
            selected: importPdfPollVote === PollVoteResult.NO,
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
      </PromotionCard.Footer>
    </PromotionCard>
  );
};
