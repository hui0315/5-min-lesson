import { createContext, useContext } from "react";

export const ChapterContext = createContext({
  prevPath: null,
  nextPath: null,
  prevLabel: null,
  nextLabel: null,
});

export const useChapterNav = () => useContext(ChapterContext);
