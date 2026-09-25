export interface UserDto {
  id?: string;
  userName: string;
  email: string;
  homePage?: string | null;
}

export interface CommentDto {
  id: string;
  text: string;
  createdAt: string;
  filePath: string | null;
  fileType: string | null;
  userId: string;
  parentId?: string | null;
  parent?: CommentDto | null;
  user: UserDto;

  replies?: CommentDto[];
}

export interface CreateCommentRequest {
  text: string;
  parentId?: string | null;
  user: Pick<UserDto, 'userName' | 'email' | 'homePage'>;
}

export interface PagedComments {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  comments: CommentDto[];
}
