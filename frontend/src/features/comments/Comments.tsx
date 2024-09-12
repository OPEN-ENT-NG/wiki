import { Save, Send } from '@edifice-ui/icons';
import {
  Avatar,
  Badge,
  Button,
  EmptyScreen,
  Heading,
  useDate,
  useDirectory,
  useOdeClient,
  usePaths,
} from '@edifice-ui/react';
import { useQueries } from '@tanstack/react-query';
import { odeServices, UserProfile } from 'edifice-ts-client';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Comment as CommentProps } from '~/models';

interface CommentCallbacks {
  post: (comment: string) => Promise<void>;
  put: ({
    comment,
    commentId,
  }: {
    comment: string;
    commentId: string;
  }) => Promise<void>;
  delete: (commentId: string) => Promise<void>;
  reset?: () => void;
}

interface RootProps {
  comments: CommentProps[] | undefined;
  callbacks: CommentCallbacks;
  options?: Partial<CommentOptions>;
}

type CommentOptions = {
  maxCommentLength: number;
  maxReplyLength: number;
  maxComments: number;
  maxReplies: number;
  showBadgeProfile: boolean;
};

interface UserProfileResult {
  userId: string;
  profile: UserProfile[number];
}

const CommentContext = createContext<{
  comments: CommentProps[] | undefined;
  content: string;
  editCommentId: string | null;
  profiles: (UserProfileResult | undefined)[];
  options: Partial<CommentOptions>;
  setEditCommentId: (value: string | null) => void;
  handleModifyComment: (commentId: string) => void;
  handleChangeContent: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCreateComment: (content: string) => void;
  handleUpdateComment: (comment: string) => void;
  handleDeleteComment: (id: string) => void;
  handleReset: () => void;
} | null>(null);

export const useCommentsContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error(`Cannot be rendered outside the Card component`);
  }
  return context;
};

const TextCounter = ({
  content,
  maxLength,
}: {
  content: string;
  maxLength: number;
}) => {
  return (
    <p className="small text-gray-700 p-2 text-end">
      {`${content?.length || 0} / ${maxLength}`}
    </p>
  );
};

const CommentHeader = ({ title }: { title: string }) => {
  return (
    <Heading level="h3" headingStyle="h3">
      {title}
    </Heading>
  );
};

const CommentTitle = ({ children }: { children: ReactNode }) => {
  return <span className="small text-gray-800">{children}</span>;
};

const CommentAvatar = ({ id }: { id: string }) => {
  const { getAvatarURL } = useDirectory();
  const { t } = useTranslation();

  return (
    <Avatar
      alt={t('comment.author.avatar')}
      size="sm"
      src={getAvatarURL(id, 'user')}
      variant="circle"
    />
  );
};

const CommentDate = ({ createdAt }: { createdAt: string }) => {
  return createdAt ? (
    <>
      <span className="small text-gray-700">|</span>
      <span className="small text-gray-700">{createdAt}</span>
    </>
  ) : null;
};

const BadgeProfile = ({ profile }: { profile: UserProfile[number] }) => {
  const { t } = useTranslation();

  const getProfile = (profile: UserProfile[0]) => t(`${profile}`);
  return (
    <Badge
      variant={{
        type: 'user',
        profile,
        background: true,
      }}
    >
      {getProfile(profile)}
    </Badge>
  );
};

const useProfileQueries = (usersIds: string[]) => {
  const results = useQueries({
    queries: usersIds.map((userId) => ({
      queryKey: ['post', userId],
      queryFn: async () => {
        const data = await odeServices.session().getUserProfile({ userId });
        return {
          userId,
          profile: data[0],
        };
      },
      staleTime: Infinity,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        isLoading: results.some((result) => result.isLoading),
      };
    },
  });
  return results;
};

export function CommentList() {
  const { user } = useOdeClient();

  const { comments, profiles } = useCommentsContext();

  return comments?.map((comment) => {
    const { authorId } = comment;

    const profile =
      profiles?.find((user) => user?.userId === authorId)?.profile ?? 'Guest';

    return (
      <Comment
        key={comment.id}
        comment={comment}
        profile={profile}
        userId={user?.userId as string}
      />
    );
  });
}

const useAutosizeTextArea = (
  value: string
): [
  React.RefObject<HTMLTextAreaElement>,
  (event: React.FocusEvent<HTMLTextAreaElement>) => void
] => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      const scrollHeight = ref.current.scrollHeight;

      ref.current.style.height = scrollHeight + 'px';
    }
  }, [ref, value]);

  const onFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    event.currentTarget.setSelectionRange(
      event.currentTarget.value.length + 1,
      event.currentTarget.value.length + 1
    );
  };

  return [ref, onFocus];
};

const CommentForm = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const {
    content,
    handleChangeContent,
    handleCreateComment,
    setEditCommentId,
    options,
  } = useCommentsContext();

  const [ref] = useAutosizeTextArea(content);

  return (
    <div className="border rounded-3 p-12 pb-8 d-flex gap-12 bg-gray-200">
      <CommentAvatar id={userId as string} />
      <div className="d-flex flex-column flex-fill gap-8">
        <CommentTitle>{t('comment.placeholder')}</CommentTitle>
        <textarea
          id="add-comment"
          ref={ref}
          value={content}
          className="form-control"
          placeholder={t('comment.placeholder.textarea')}
          maxLength={options.maxCommentLength as number}
          onChange={handleChangeContent}
          // onFocus={() => setEditCommentId(null)}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
        />
        <div className="d-flex justify-content-between align-items-center">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            leftIcon={<Send />}
            disabled={!content?.length}
            onClick={() => handleCreateComment(content)}
          >
            {t('comment.post')}
          </Button>
          <TextCounter
            content={content}
            maxLength={options.maxCommentLength as number}
          />
        </div>
      </div>
    </div>
  );
};

const Comment = ({
  comment,
  userId,
  profile,
}: {
  comment: CommentProps;
  userId: string;
  profile: UserProfile[number];
}) => {
  const [value, setValue] = useState<string>('');

  const { id, authorId, authorName, createdAt, comment: content } = comment;

  const [ref, onFocus] = useAutosizeTextArea(value);

  const { t } = useTranslation();
  const { fromNow } = useDate();

  const {
    editCommentId,
    options,
    handleDeleteComment: onDeleteComment,
    handleModifyComment,
    handleReset,
    handleUpdateComment,
  } = useCommentsContext();

  const isEditing = editCommentId === comment.id;

  const getDate = (createdAt: number) =>
    t('comment.publish.date', {
      date: fromNow(createdAt),
    });

  useEffect(() => {
    /* if (isEditing) {
      console.log({ isEditing });
      ref.current?.focus();
      // setValue(value + ' ');
    } */
    ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleChangeContent = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setValue(event.target.value);
  };

  const onMouseUp = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    const length = event.currentTarget.value.length;
    event.currentTarget.setSelectionRange(length, length);
  };

  return (
    <div
      key={id}
      className={`${
        isEditing
          ? 'border rounded-3 p-12 pb-8 d-flex gap-12 bg-gray-200  my-16'
          : 'border rounded-3 p-12 pb-8 d-flex gap-12 mt-16'
      }`}
    >
      <CommentAvatar id={authorId} />
      <div className="flex flex-fill">
        <div className="d-flex align-items-center gap-12">
          <CommentTitle>{authorName}</CommentTitle>

          {options.showBadgeProfile && <BadgeProfile profile={profile} />}

          <CommentDate createdAt={getDate(createdAt)} />
        </div>

        {isEditing ? (
          <>
            <div className="mt-8 mb-4">
              <textarea
                id="add-comment"
                ref={ref}
                value={value}
                className="form-control"
                placeholder={t('comment.placeholder')}
                maxLength={options.maxCommentLength as number}
                onChange={handleChangeContent}
                rows={1}
                style={{ resize: 'none', overflow: 'hidden' }}
                onFocus={() => console.log('focus')}
                onMouseUp={onMouseUp}
                onBlur={() => console.log('blur')}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Save />}
                  disabled={!content?.length}
                  onClick={() => handleUpdateComment(value)}
                >
                  {t('comment.save')}
                </Button>
                <Button
                  variant="ghost"
                  color="tertiary"
                  size="sm"
                  onClick={handleReset}
                >
                  {t('comment.cancel')}
                </Button>
              </div>
              <TextCounter
                content={value}
                maxLength={options.maxCommentLength as number}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 mb-4">{content}</div>

            {userId === authorId && (
              <div className="ms-n8">
                <Button
                  variant="ghost"
                  color="tertiary"
                  size="sm"
                  onClick={() => {
                    handleModifyComment(comment.id);
                    setValue(content);
                  }}
                >
                  {t('comment.edit')}
                </Button>
                <Button
                  variant="ghost"
                  color="tertiary"
                  size="sm"
                  onClick={() => onDeleteComment(id)}
                >
                  {t('comment.remove')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const CommentProvider = ({
  comments,
  callbacks,
  options: commentOptions,
}: RootProps) => {
  const options = {
    maxCommentLength: 200,
    maxReplyLength: 200,
    maxComments: 2,
    additionalComments: 5,
    maxReplies: 10,
    showBadgeProfile: true,
    ...commentOptions,
  };

  const [content, setContent] = useState<string>('');
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLimit, setCommentLimit] = useState(options.maxComments);
  const [imagePath] = usePaths();

  const { t } = useTranslation();
  const { user } = useOdeClient();

  const usersIds = Array.from(
    new Set(comments?.map((comment) => comment.authorId))
  );

  const profilesQueries = useProfileQueries(usersIds);

  const commentsCount = comments?.length ?? 0;

  const title =
    commentsCount && commentsCount > 1
      ? t('comment.several', { number: commentsCount })
      : t('comment.little', { number: commentsCount });

  const displayedComments = useMemo(
    () => comments?.slice(0, commentLimit) ?? [],
    [comments, commentLimit]
  );

  const handleMoreComments = () => {
    const newLimit =
      displayedComments?.length + (options.additionalComments || 5);

    if (newLimit === displayedComments.length) return;

    setCommentLimit(newLimit);
  };

  const handleChangeContent = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(event.target.value);
  };

  const handleReset = () => {
    callbacks.reset?.();
    setContent('');

    if (editCommentId) setEditCommentId(null);
  };

  const handleDeleteComment = (id: string) => {
    callbacks.delete(id);
  };

  const handleUpdateComment = (comment: string) => {
    if (editCommentId) {
      callbacks.put({ comment, commentId: editCommentId });
      setEditCommentId(null);
    }
  };

  const handleCreateComment = (content: string) => {
    callbacks.post(content);
    setContent('');
  };

  const handleModifyComment = (commentId: string) => {
    setEditCommentId(commentId);
  };

  const values = useMemo(
    () => ({
      comments: displayedComments,
      content,
      profiles: profilesQueries.data,
      editCommentId,
      options,
      setEditCommentId,
      handleCreateComment,
      handleModifyComment,
      handleUpdateComment,
      handleDeleteComment,
      handleReset,
      handleChangeContent,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comments, content, editCommentId, profilesQueries, options]
  );

  return (
    <CommentContext.Provider value={values}>
      <div className="my-24">
        <CommentHeader title={title} />

        <div className="my-24">
          {user && <CommentForm userId={user.userId} />}
          {commentsCount && !profilesQueries.isLoading ? (
            <>
              <CommentList />

              {displayedComments.length !== comments?.length && (
                <Button
                  variant="ghost"
                  color="tertiary"
                  onClick={handleMoreComments}
                  className="my-16"
                >
                  Lire plus de commentaires
                </Button>
              )}
            </>
          ) : null}
        </div>

        {!commentsCount && (
          <div className="m-auto my-24 d-flex flex-column align-items-center gap-12">
            <EmptyScreen
              imageSrc={`${imagePath}/emptyscreen/illu-pad.svg`}
              text={t('comment.emptyscreen')}
            />
          </div>
        )}
      </div>
    </CommentContext.Provider>
  );
};

export default CommentProvider;
