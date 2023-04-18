export type CommitDescription = {
  hash: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
  message: string;
};
