import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";

export function useKeyboardPadding(insets?: EdgeInsets | null) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      const kh = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(Math.max(0, kh - (insets?.bottom || 0)));
    };
    const onHide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(showEvent as any, onShow);
    const subHide = Keyboard.addListener(hideEvent as any, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [insets?.bottom]);

  return keyboardHeight;
}
