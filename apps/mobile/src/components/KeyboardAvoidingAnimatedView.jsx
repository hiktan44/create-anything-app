import React, { useRef, useEffect } from "react";
import { Platform, Keyboard, KeyboardAvoidingView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const KeyboardAvoidingAnimatedView = (props, ref) => {
  const {
    children,
    behavior = Platform.OS === "ios" ? "padding" : "height",
    keyboardVerticalOffset = 0,
    style,
    contentContainerStyle,
    enabled = true,
    onLayout,
    ...leftoverProps
  } = props;

  const animatedViewRef = useRef(null); // ref to the native view for measurements
  const layoutDataRef = useRef(null); // store layout data (relative coordinates)
  const initialHeightRef = useRef(0); // original height of animated view before keyboard appears
  const bottomRef = useRef(0); // current bottom offset value of animated view
  const bottomHeight = useSharedValue(0); // whats going to be added to the bottom when keyboard appears

  useEffect(() => {
    if (!enabled) return;

    const onKeyboardShow = (event) => {
      const { duration, endCoordinates } = event;
      const viewRef = animatedViewRef.current;
      const layoutData = layoutDataRef.current;

      if (!viewRef || !layoutData) return;

      // Use measureInWindow to get absolute screen coordinates
      viewRef.measureInWindow((x, y, width, height) => {
        // Calculate how much the view needs to move up
        const keyboardY = endCoordinates.screenY - keyboardVerticalOffset;
        const viewBottom = y + height;
        const overlappingHeight = Math.max(viewBottom - keyboardY, 0);

        bottomHeight.value = withTiming(overlappingHeight, {
          duration: duration > 10 ? duration : 300,
        });
        bottomRef.current = overlappingHeight;
      });
    };

    const onKeyboardHide = () => {
      bottomHeight.value = withTiming(0, { duration: 300 });
      bottomRef.current = 0;
    };

    const showListener = Keyboard.addListener("keyboardWillShow", onKeyboardShow);
    const hideListener = Keyboard.addListener("keyboardWillHide", onKeyboardHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardVerticalOffset, enabled, bottomHeight]);

  const animatedStyle = useAnimatedStyle(() => {
    if (behavior === "height") {
      return {
        height: initialHeightRef.current - bottomHeight.value,
        flex: bottomHeight.value > 0 ? 0 : null,
      };
    }
    if (behavior === "padding") {
      return {
        paddingBottom: bottomHeight.value,
      };
    }
    return {};
  });

  const positionAnimatedStyle = useAnimatedStyle(() => ({
    bottom: bottomHeight.value,
    // Add position: 'relative' to ensure bottom property works
    position: 'relative',
  }));

  const handleLayout = (event) => {
    const layout = event.nativeEvent.layout;
    layoutDataRef.current = layout;

    // Store initial height before keyboard appears
    if (!initialHeightRef.current) {
      initialHeightRef.current = layout.height;
    }

    if (onLayout) {
      onLayout(event);
    }
  };

  const handleRef = (node) => {
    // Store the native view reference for measureInWindow
    animatedViewRef.current = node;
    // Forward the ref if provided
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const renderContent = () => {
    if (behavior === "position") {
      return (
        <Animated.View style={[contentContainerStyle, positionAnimatedStyle]}>
          {children}
        </Animated.View>
      );
    }
    // render children if padding or height
    return children;
  };

  // for web, default to unused keyboard avoiding view
  if (Platform.OS === "web") {
    return (
      <KeyboardAvoidingView
        behavior={behavior}
        style={style}
        contentContainerStyle={contentContainerStyle}
        {...leftoverProps}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      ref={handleRef}
      style={[style, animatedStyle]}
      onLayout={handleLayout}
      {...leftoverProps}
    >
      {renderContent()}
    </Animated.View>
  );
};

KeyboardAvoidingAnimatedView.displayName = "KeyboardAvoidingAnimatedView";

export default KeyboardAvoidingAnimatedView;
