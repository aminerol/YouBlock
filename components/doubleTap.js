import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';

export default class DoubleTap extends React.Component {
  static defaultProps = {
    delay: 250,
    onTaps: [],
  };

  constructor() {
    super();

    // Timer Vars
    this._timer = null;
    this._tapCount = 0;

    // Bind functions to instance
    this._bind();
  }

  _bind() {
    this.onPress = this.onPress.bind(this);
    this._timerExpired = this._timerExpired.bind(this);
  }

  reset() {
    this._timer = null;
    this._tapCount = 0;
  }

  onPress() {
    this._timer
      ? this._handlePress()
      : this._handleInitialPress();
  }

  _handlePress() {
    this._tapCount++;
    this._shouldKeepListening()
      ? this._extendTimer()
      : this._forceExpire();
  }

  _handleInitialPress() {
    this._tapCount = 1;
    this._shouldKeepListening()
      ? this._startTimer()
      : this._forceExpire();
  }

  _startTimer() {
    this._timer = setTimeout(this._timerExpired, this.props.delay);
  }

  _extendTimer() {
    clearTimeout(this._timer);
    this._startTimer();
  }

  _forceExpire() {
    clearTimeout(this._timer);
    this._timerExpired();
  }

  _timerExpired() {
    // Find and run the proper handler for the tap count
    let current = this.props.onTaps.find((row) => row.count === this._tapCount);
    current && (current.action && current.action())
    // Reset timer and tap count
    this.reset();
  }

  _shouldKeepListening() {
    // Check if there are any listeners assigned to tapCounts
    // higher than the current count
    return this.props.onTaps.find((row) => {
      return !!(row.count > this._tapCount && row.action);
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={this.onPress} >
        {this.props.children}
      </TouchableWithoutFeedback>
    );
  }
}