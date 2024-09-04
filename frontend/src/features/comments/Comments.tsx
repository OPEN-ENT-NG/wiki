import { Send } from '@edifice-ui/icons';
import {
  Avatar,
  Button,
  FormControl,
  TextArea,
  useDate,
  useDirectory,
  useUser,
} from '@edifice-ui/react';
import clsx from 'clsx';
import { UserProfile } from 'edifice-ts-client';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Comment } from '~/models';

export interface CommentsHeaderProps<T> {
  comments: T;
}

export interface CommentActions {
  /** Truthy if the user can create a new comment. */
  canCreate: boolean;
  /** Truthy if the user can edit (and update) the comment. */
  canEdit: (comment: Comment) => boolean;
  /** Truthy if the user can remove the comment. */
  canRemove: (comment: Comment) => boolean;
  /** Action to create a comment; invalidates cached queries if needed. */
  create: (content: string) => void;
  /** Action to update a comment; invalidates cached queries if needed. */
  update: (comment: Comment) => void;
  /** Action to delete a comment; invalidates cached queries if needed. */
  remove: (commentId: string) => void;
}

// export const useComments = (): CommentActions => {
//   const { user } = useUser();
//   /* const { creator, manager, canComment } =
//     useActionDefinitions(postCommentActions); */

//   const userRights = useUserRights();

//   const creator = userRights.creator;
//   const manager = userRights.manager;

//   const canEdit = (comment: Comment) =>
//     comment.author.userId === user?.userId && canComment;

//   const canRemove = (comment: Comment) =>
//     creator || manager || canEdit(comment);

//   const createMutation = useCreateComment(blogId, postId);
//   const deleteMutation = useDeleteComment(blogId, postId);
//   const updateMutation = useUpdateComment(blogId, postId);

//   return {
//     canCreate: canComment,
//     canEdit,
//     canRemove,
//     create: (content: string) => createMutation.mutate({ content }),
//     remove: (commentId: string) => deleteMutation.mutate({ commentId }),
//     update: (comment: Comment) => updateMutation.mutate({ comment }),
//   };
// };

export const CommentsHeader = ({
  comments,
}: CommentsHeaderProps<Comment[]>) => {
  const { t } = useTranslation('wiki');

  return (
    <h3>
      {comments.length} {t('blog.comments')}
    </h3>
  );
};

const MAX_COMMENT_LENGTH = 200;

const TextareaCounter = ({
  content,
  maxLength,
}: {
  content: string;
  maxLength: number;
}) => {
  return (
    <p className="small text-gray-700 p-2 text-end">
      {content ? `${content.length} / ${maxLength}` : ''}
    </p>
  );
};

export const CommentCard = () => {
  const mode = 'edit';

  const [editable, setEditable] = useState(mode || 'edit');
  const [comment, setComment] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const { getAvatarURL, getUserbookURL } = useDirectory();
  const { t } = useTranslation('common');
  const { fromNow } = useDate();
  /* const badge = useMemo(() => {
    const profile = author.profiles?.[0] ?? 'Guest';
    if (['Teacher', 'Student', 'Relative', 'Personnel'].indexOf(profile) < 0)
      return null;

    return (
      <Badge
        variant={{
          type: 'profile',
          //@ts-ignore -- Checked above
          profile: profile.toLowerCase(),
        }}
      >
        {t(profile)}
      </Badge>
    );
  }, [author.profiles, t]); */

  // Modifying an existing comment ? Truthy if yes, falsy if creating a new one.
  /* const modifying = content !== undefined;

  const handleEditClick = () => setEditable(true);

  const handleRemoveClick = () => onRemove?.();

  const handlePublishClick = () => {
    onPublish?.(comment);
    if (refTextArea.current) {
      refTextArea.current.value = '';
    }
    setEditable(mode === 'edit');
    if (!content.length) {
      setComment('');
    }
  };

  const handleCancelClick = () => {
    setComment(content);
    setEditable(mode === 'edit');
  }; */

  const cssClasses = clsx('border rounded-3 p-12 pb-8 d-flex', {
    'bg-gray-200': mode === 'edit',
  });

  return (
    <div className={cssClasses}>
      <Avatar
        alt={t('comment.author.avatar')}
        size="sm"
        // src={getAvatarURL(author.userId, 'user')}
        variant="circle"
      />
      <div className="d-flex flex-column flex-grow-1">
        <div className="ms-8 text-break">
          {editable ? (
            <div className="d-flex flex-column flex-fill gap-8">
              <p className="small">{t('comment.placeholder')}</p>
              <div className="border rounded-3 px-16 pt-12 pb-8 d-flex gap-2 flex-column bg-white">
                <FormControl id="comment" isRequired>
                  <TextArea
                    size="sm"
                    ref={ref}
                    className="border-0 bg-transparent text-break"
                    maxLength={MAX_COMMENT_LENGTH}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></TextArea>
                  {'1Z21212' && (
                    <TextareaCounter
                      content="1Z21212"
                      maxLength={MAX_COMMENT_LENGTH}
                    />
                  )}
                  <Button type="submit" leftIcon={<Send />}>
                    Envoyer
                  </Button>
                </FormControl>
                <div className="gap-12">
                  {/* {modifying && (
                    <Button
                      variant="ghost"
                      color="tertiary"
                      size="sm"
                      onClick={handleCancelClick}
                    >
                      {t('cancel')}
                    </Button>
                  )} */}
                  {/* <Button
                    leftIcon={<Send />}
                    variant="ghost"
                    size="sm"
                    onClick={handlePublishClick}
                    disabled={!comment.length}
                  >
                    {t('comment.post')}
                  </Button> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="ms-4">
              <div className="mb-8 d-flex flex-column flex-md-row text-gray-700 small column-gap-12 align-items-md-center">
                <a
                  href="/"
                  //   href={getUserbookURL(author.userId, 'user')}
                  className="comment-card-author"
                >
                  {/* {author.username} */} ADMC
                </a>
                {/* {badge} */}
                {/* {created && (
                  <>
                    <span className="separator d-none d-md-block"></span>
                    <span>
                      {t('comment.publish.date', { date: fromNow(created) })}
                    </span>
                  </>
                )} */}
                <span className="separator d-none d-md-block"></span>
                <span>
                  date
                  {/* {t('comment.publish.date', { date: fromNow(created) })} */}
                </span>
              </div>
              <div className="comment-card-content">contenu</div>
            </div>
          )}
        </div>

        {/* {mode !== 'print' && !editable && (
          <div className="ms-4">
            {onPublish && (
              <Button
                variant="ghost"
                color="tertiary"
                size="sm"
                onClick={handleEditClick}
              >
                {t('edit')}
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                color="tertiary"
                size="sm"
                onClick={handleRemoveClick}
              >
                {t('remove')}
              </Button>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

export const CommentsCreate = () => {
  const { user } = useUser();
  // const { canCreate, create } = useComments(blogId!, postId!);

  //   if (!user?.userId || !blogId || !postId) return null;

  const userAsAuthor = {
    userId: user?.userId,
    username: user?.username,
    profiles: user?.type as unknown as UserProfile,
  };

  /* const handlePublish = (content: Content) => {
    create(content as string);
  }; */

  return (
    <CommentCard
    /* className="mt-16" */
    /* author={userAsAuthor} */
    /* mode="edit" */
    //   onPublish={handlePublish}
    />
  );
};
