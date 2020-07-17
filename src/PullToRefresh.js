/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Animated, Text, Dimensions, FlatList} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';

const WIDTH = Dimensions.get('window').width;

export default class PullToRefresh extends React.Component {
  headerHeight = 200;
  scrollY = 0;
  containerTop = new Animated.Value(0);
  containerTopValue = 0;
  constructor(props) {
    super(props);
    let data = [];
    for (let i = 0; i < 100; i++) {
      data.push(i);
    }
    this.state = {
      data,
      panEnabled: true,
    };
    this.containerTop.addListener(({value}) => {
      this.containerTopValue = value;
    });
  }

  onScroll = event => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY === 0) {
      if (!this.state.panEnabled) {
        this.setState({panEnabled: true});
      }
    } else {
      if (this.state.panEnabled) {
        this.setState({panEnabled: false});
      }
    }
    this.scrollY = currentScrollY;
  };

  onHandlerStateChange = ({nativeEvent}) => {
    switch (nativeEvent.state) {
      case State.UNDETERMINED:
        console.log('等待手势');
        break;
      case State.BEGAN:
        console.log('手势开始');
        break;
      case State.CANCELLED:
        console.log('手势取消');
        Animated.timing(this.containerTop, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {});
        break;
      case State.ACTIVE:
        console.log(nativeEvent);
        console.log('手势活跃');
        break;
      case State.END:
        console.log('手势结束', this.containerTopValue);

        if (this.containerTopValue > 300) {
          Animated.timing(this.containerTop, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }).start();
          if (this.releaseTimeout) {
            clearTimeout(this.releaseTimeout);
          }
          this.releaseTimeout = setTimeout(() => {
            Animated.timing(this.containerTop, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {});
          }, 5000);
        } else {
          Animated.timing(this.containerTop, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }

        break;
      case State.FAILED:
        console.log('失败');
        break;
      default:
        console.log('其他');
        break;
    }
  };

  onPanGestureEvent = Animated.event(
    [{nativeEvent: {translationY: this.containerTop}}],
    {
      useNativeDriver: true,
    },
  );

  // 下拉移动距离的映射
  PULL_INPUT_RANGE = (() => {
    const arr = [];
    for (let i = 0; i <= 800; i++) {
      arr.push(i);
    }
    return arr;
  })();

  // 使用对数函数作为弹力算法
  PULL_OUTPUT_RANGE = this.PULL_INPUT_RANGE.map(i =>
    i === 0 ? 0 : Math.log(i) * ((i / 10 + 1) * 0.6),
  );

  render() {
    const heightState = this.containerTop.interpolate({
      inputRange: this.PULL_INPUT_RANGE,
      outputRange: this.PULL_OUTPUT_RANGE,
      extrapolate: 'clamp',
    });
    const progressState = this.containerTop.interpolate({
      inputRange: [200, 300],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <PanGestureHandler
        maxPointers={1}
        enabled={this.state.panEnabled}
        onHandlerStateChange={this.onHandlerStateChange}
        activeOffsetY={0}
        onGestureEvent={this.onPanGestureEvent}>
        <Animated.View
          style={{
            flex: 1,
            width: WIDTH,
            position: 'absolute',
            top: -this.headerHeight,
            height: 800,
            transform: [{translateY: heightState}],
          }}>
          <View
            style={{
              width: WIDTH,
              height: this.headerHeight,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <LottieView
              source={require('./material-wave-loading.json')}
              ref={ref => {
                this.lottieRef = ref;
              }}
              style={{width: 100, height: 100}}
              progress={progressState}
              autoPlay={true}
            />
          </View>

          <FlatList
            ref={ref => {
              this.scrollRef = ref;
            }}
            scrollEnabled={this.state.scrollEnabled}
            onScroll={this.onScroll}
            style={{
              width: WIDTH,
              backgroundColor: 'grey',
              flex: 1,
            }}
            overScrollMode="never"
            keyExtractor={item => item + ''}
            data={this.state.data}
            renderItem={(item, index) => (
              <View
                key={item + ''}
                style={{backgroundColor: 'green', height: 150, marginTop: 15}}>
                <Text>{item.index}</Text>
              </View>
            )}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  }
}
