/** @module
 *
 * Types shared by git utils. */

/** Represents a commit in a Git repository. */
export type CommitDescription = {
  hash: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
  message: string;
};
