import React from "react";
import { Typography } from "antd";

export const ColorizedAction: React.VFC<{ actionName: string }> = ({
  actionName,
}) => {
  console.log("Render Colorized Action");
  const splitted = split(actionName);
  if (splitted.length <= 1) return <>{actionName}</>;

  const categorized = categorize(splitted);
  const colorized = colorize(categorized);
  const component = componentrize(colorized);
  return <>{component}</>;
};

/**
 * Constants
 */
const SEPARATOR = "/";
const RTK_THUNK_LIST = ["pending", "fulfilled", "rejected"]; // NOTE: https://redux-toolkit.js.org/api/createAsyncThunk#type
const COLOR_PALETTE = ["#ec5f67", "#E0AF02", "#0c969b", "#994cc3"];
const SEPARATOR_COLOR = "#CCD1E4";
const SPECIAL_TEXT_COLOR = "#CCD1E4";

/**
 * Types
 */
type TextWithMeta = {
  text: string;
  isSeparator?: boolean;
  isSpecialText?: boolean;
  color?: string;
};

/**
 * Helpers
 */
const split = (text: string) => {
  let parts = text.split(SEPARATOR);
  for (let i = parts.length; i-- > 1; ) parts.splice(i, 0, SEPARATOR);
  return parts;
};

const categorize = (list: string[]): TextWithMeta[] => {
  return list.map((text) => {
    if (text === SEPARATOR) return { text, isSeparator: true };
    if (RTK_THUNK_LIST.includes(text)) return { text, isSpecialText: true };
    return { text };
  });
};

const colorize = (list: TextWithMeta[]): TextWithMeta[] => {
  let i = 0;
  return list.map((item) => {
    if (item.isSeparator) return { ...item, color: SEPARATOR_COLOR };
    if (item.isSpecialText) return { ...item, color: SPECIAL_TEXT_COLOR };
    const obj = { ...item, color: COLOR_PALETTE[i] };
    if (i === COLOR_PALETTE.length - 1) {
      i = 0;
    } else {
      i += 1;
    }
    return obj;
  });
};

const componentrize = (list: TextWithMeta[]) => {
  const components = list.map(({ text, isSeparator, isSpecialText, color }) => {
    const paddingHorizontal = isSeparator
      ? { paddingLeft: 1, paddingRight: 1 }
      : {};
    return (
      <Typography.Text
        style={{ color, ...paddingHorizontal }}
        italic={isSpecialText}
        underline={isSpecialText}
      >
        {text}
      </Typography.Text>
    );
  });
  return <>{components}</>;
};
