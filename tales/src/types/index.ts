export interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: any;
}

export interface Profile {
  userID: string;
  displayName: string;
  bio: string;
  profileImage: string;
  followers: string[];
  following: string[];
  stories: string[];
}

export interface Story {
  id?: string;
  storyID: string;
  userID: string;
  content: string;
  imageURL: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export interface Comment {
  commentID?: string;
  storyID: string;
  userID: string;
  text: string;
  createdAt: any;
}

export interface Like {
  storyID: string;
  userID: string;
  createdAt: any;
}
