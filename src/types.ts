import { StatusType, StatusTitle } from "./constants.js";

export type Status = {
  type: (typeof StatusType)[keyof typeof StatusType];
  title: (typeof StatusTitle)[keyof typeof StatusTitle];
};

export type Task = {
  id: string;
  title: string;
  status: Status;
};
