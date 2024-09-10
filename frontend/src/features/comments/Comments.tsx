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
import { MAX_COMMENT_LENGTH } from '~/config';
import { Comment as CommentProps } from '~/models';

const CommentsContext = createContext<{
  comments: CommentProps[];
  content: string;
  editCommentId: string | null;
  profiles: Array<{
    userId: string;
    profile: UserProfile[number];
  }>;
  setEditCommentId: (value: string | null) => void;
  handleOnUpdateComment: (commentId: string) => void;
  handleOnChangeContent: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleOnPostComment: (content: string) => void;
  handleOnPutComment: (comment: string) => void;
  handleOnDeleteComment: (id: string) => void;
  handleOnReset: () => void;
} | null>(null);

export const useCommentsContext = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error(`Cannot be rendered outside the Card component`);
  }
  return context;
};

const useComments = () => {
  const { t } = useTranslation();
  const { fromNow } = useDate();

  const translations = {
    avatar: t('comment.author.avatar'),
    cancel: t('cancel'),
    post: t('comment.post'),
    placeholder: t('comment.placeholder'),
    loading: t('comment.loading.profile'),
    remove: t('remove'),
    edit: t('edit'),
    // emptyscreen: t('comment.emptyscreen.text'),
    emptyscreen: t('Pas encore de commentaire, soyez le premier à commenter'),
    date: (createdAt: number) =>
      t('comment.publish.date', {
        date: fromNow(createdAt),
      }),
    getProfile: (profile: UserProfile[0]) => t(`${profile}`),
  };

  const classes = {
    separator: 'small text-gray-700',
    date: 'small text-gray-700',
    edit: {
      border: 'border rounded-3 p-12 pb-8 d-flex gap-12 bg-gray-200',
      flex: 'd-flex flex-column flex-fill gap-8',
      footer: 'd-flex align-items-center justify-content-end gap-12 me-16 mb-8',
    },
    read: {
      border: 'border rounded-3 p-12 pb-8 d-flex gap-12 mt-16',
      flex: 'd-flex align-items-center gap-12',
    },
  };

  return {
    translations,
    classes,
  };
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

const CommentHeaderTitle = ({ children }: { children: ReactNode }) => {
  return <span className="small text-gray-800">{children}</span>;
};

const CommentAvatar = ({ id, alt }: { id: string; alt: string }) => {
  const { getAvatarURL } = useDirectory();

  return (
    <Avatar
      alt={alt}
      size="sm"
      src={getAvatarURL(id, 'user')}
      variant="circle"
    />
  );
};

const CommentDate = ({
  createdAt,
  dateStyle,
  separatorStyle,
}: {
  createdAt: string;
  dateStyle: string;
  separatorStyle: string;
}) => {
  return createdAt ? (
    <>
      <span className={separatorStyle}>|</span>
      <span className={dateStyle}>{createdAt}</span>
    </>
  ) : null;
};

const BadgeProfile = ({
  loadingText,
  profile,
  profileI18n,
}: {
  loadingText: string;
  profile: UserProfile[number];
  profileI18n: (profile: UserProfile[number]) => string;
}) => {
  return profile ? (
    <Badge
      variant={{
        type: 'profile',
        profile,
      }}
    >
      {profileI18n(profile)}
    </Badge>
  ) : (
    <span>{loadingText}</span>
  );
};

const useGetUsersProfile = (data: string[]) => {
  const profileQueries = useQueries({
    queries: data.map((id) => {
      return {
        queryKey: ['user', id],
        queryFn: async (userId: string) => {
          const data = await odeServices.session().getUserProfile({ userId });
          return {
            userId: id,
            profile: data[0],
          };
        },
      };
    }),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        loading: results.some((result) => result.isLoading),
      };
    },
  });

  return profileQueries;
};

export function CommentsList() {
  const { translations, classes } = useComments();
  const { user } = useOdeClient();

  const { comments } = useCommentsContext();

  return comments?.map((comment) => {
    const { authorId } = comment;

    // const profile = profiles.find((user) => user.userId === authorId)?.profile;
    const profile = 'Teacher';

    return (
      <Comment
        key={comment.id}
        comment={comment}
        profile={profile}
        userId={user?.userId as string}
        translations={translations}
        classes={classes}
      />
    );
  });
}

const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;

      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};

const CommentForm = ({ classes, translations, userId }: any) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const { t } = useTranslation();

  const { content, handleOnChangeContent, handleOnPostComment } =
    useCommentsContext();

  useAutosizeTextArea(ref.current, content);
  return (
    <div className={classes.edit.border}>
      <CommentAvatar id={userId as string} alt={translations.avatar} />
      <div className={classes.edit.flex}>
        <CommentHeaderTitle>{translations.placeholder}</CommentHeaderTitle>
        <textarea
          id="add-comment"
          ref={ref}
          value={content}
          className="form-control"
          placeholder={t('comment.placeholder')}
          maxLength={MAX_COMMENT_LENGTH}
          onChange={handleOnChangeContent}
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
            onClick={() => handleOnPostComment(content)}
          >
            {translations.post}
          </Button>
          <TextCounter content={content} maxLength={MAX_COMMENT_LENGTH} />
        </div>
      </div>
    </div>
  );
};

const Comment = ({
  comment,
  userId,
  translations,
  classes,
  profile,
}: {
  comment: CommentProps;
  userId: string;
  translations: any;
  classes: any;
  profile: UserProfile[number];
}) => {
  const { id, authorId, authorName, createdAt, comment: content } = comment;
  const { t } = useTranslation();

  const ref = useRef<HTMLTextAreaElement | null>(null);
  useAutosizeTextArea(ref.current, content);

  const {
    editCommentId,
    handleOnDeleteComment: onDeleteComment,
    handleOnUpdateComment,
    handleOnReset,
    handleOnPutComment,
    handleOnChangeContent,
  } = useCommentsContext();

  const isEditing = editCommentId === comment.id;

  return (
    <div
      key={id}
      className={`${
        isEditing ? `${classes.edit.border}  my-16` : `${classes.read.border}`
      }`}
    >
      <CommentAvatar id={authorId} alt={translations.avatar} />
      <div className="flex flex-fill">
        <div className={classes.read.flex}>
          <CommentHeaderTitle>{authorName}</CommentHeaderTitle>

          <BadgeProfile
            profile={profile}
            profileI18n={translations.getProfile}
            loadingText={translations.loading}
          />

          <CommentDate
            createdAt={translations.date(createdAt)}
            dateStyle={classes.date}
            separatorStyle={classes.separator}
          />
        </div>

        {isEditing ? (
          <>
            <div className="mt-8 mb-4">
              <textarea
                id="add-comment"
                ref={ref}
                value={content}
                className="form-control"
                placeholder={t('comment.placeholder')}
                maxLength={MAX_COMMENT_LENGTH}
                onChange={handleOnChangeContent}
                rows={1}
                style={{ resize: 'none', overflow: 'hidden' }}
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
                  onClick={() => handleOnPutComment(content)}
                >
                  {t('save')}
                </Button>
                <Button
                  variant="ghost"
                  color="tertiary"
                  size="sm"
                  onClick={handleOnReset}
                >
                  {translations.cancel}
                </Button>
              </div>
              <TextCounter content={content} maxLength={MAX_COMMENT_LENGTH} />
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
                  onClick={() => handleOnUpdateComment(comment.id)}
                >
                  {translations.edit}
                </Button>
                <Button
                  variant="ghost"
                  color="tertiary"
                  size="sm"
                  onClick={() => onDeleteComment(id)}
                >
                  {translations.remove}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const Comments = ({
  comments,
  commentMaxLength = 200,
  onReset,
  onPostComment,
  onPutComment,
  onDeleteComment,
}: {
  comments: CommentProps[] | undefined;
  commentMaxLength: number;
  onReset?: () => void;
  onPutComment: ({
    comment,
    commentId,
  }: {
    comment: string;
    commentId: string;
  }) => Promise<void>;
  onPostComment: (comment: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}) => {
  const [content, setContent] = useState<string>('');
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [imagePath] = usePaths();

  const usersIds = Array.from(
    new Set(comments?.map((comment) => comment.authorId))
  );

  const { data: profiles } = useGetUsersProfile(usersIds);

  const commentsCount = comments?.length;

  const title = commentsCount
    ? `${comments?.length} commentaires`
    : '0 commentaire';

  const { translations, classes } = useComments();
  const { user } = useOdeClient();

  const handleOnChangeContent = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(event.target.value);
  };

  const handleOnReset = () => {
    onReset?.();
    setContent('');

    if (editCommentId) setEditCommentId(null);
  };

  const handleOnDeleteComment = (id: string) => {
    onDeleteComment(id);
  };

  const handleOnPutComment = (comment: string) => {
    if (editCommentId) {
      onPutComment({ comment, commentId: editCommentId });
      setEditCommentId(null);
    }
  };

  const handleOnPostComment = (content: string) => {
    onPostComment(content);
    setContent('');
  };

  const handleOnUpdateComment = (commentId: string) => {
    setEditCommentId(commentId);
  };

  const values = useMemo(
    () => ({
      comments,
      content,
      profiles,
      editCommentId,
      setEditCommentId,
      handleOnPostComment,
      handleOnUpdateComment,
      handleOnPutComment,
      handleOnDeleteComment,
      handleOnReset,
      handleOnChangeContent,
    }),
    [comments, content, editCommentId, profiles]
  );

  return (
    <CommentsContext.Provider value={values}>
      <div className="my-24">
        {comments?.length && <CommentHeader title={title} />}

        {!comments?.length && (
          <div className="m-auto my-24 d-flex flex-column align-items-center gap-12">
            <EmptyScreen
              imageSrc={`${imagePath}/emptyscreen/illu-pad.svg`}
              text={translations.emptyscreen}
            />
          </div>
        )}

        <div className="my-24">
          <CommentForm
            classes={classes}
            userId={user?.userId}
            commentMaxLength={commentMaxLength}
            translations={translations}
            content={content}
            onReset={handleOnReset}
            onPostComment={handleOnPostComment}
            onChangeContent={handleOnChangeContent}
          />

          {comments?.length && profiles ? <CommentsList /> : null}
        </div>
      </div>
    </CommentsContext.Provider>
  );
};
