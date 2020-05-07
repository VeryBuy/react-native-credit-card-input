import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  ViewPropTypes,
  Image,
} from "react-native";

import Icons from "./Icons";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: 'white'
  },
  form: {
  },
  inputContainer: {
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 50,
  },
});

const CARD_NUMBER_INPUT_WIDTH = Dimensions.get("window").width;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120;

/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    invalidMessage: PropTypes.shape({
      number: PropTypes.string,
      expiry: PropTypes.string,
      cvc: PropTypes.string,
    }),
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInput.propTypes)),
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      // name: "CARDHOLDER'S NAME",
      // number: "CARD NUMBER",
      // expiry: "EXPIRY",
      // cvc: "CVC/CCV",
      // postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: "#E1E3E6",

    },
    validColor: "",
    invalidColor: "#FC6068",
    placeholderColor: "gray",
    allowScroll: false,
    additionalInputsProps: {},
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = field => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
      e => { throw e; },
      x => {
        scrollResponder.scrollTo({ x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true });
        this.refs[field].focus();
      });
  }

  _iconToShow = () => {
    const { focused, values: { type } } = this.props;
    if (type) return type;
    return "placeholder";
  }

  _inputProps = field => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor, invalidColor, placeholderColor,
      ref: field, field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus, onChange, onBecomeEmpty, onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  render() {
    const {
      inputContainerStyle,
      allowScroll, requiresName, requiresCVC, requiresPostalCode,
      status, invalidMessage,
    } = this.props;

    return (
      <View style={s.container}>
        <ScrollView ref="Form"
          keyboardShouldPersistTaps="always"
          scrollEnabled={allowScroll}
          showsHorizontalScrollIndicator={false}
          style={s.form}>
          <CCInput {...this._inputProps("number")}
            keyboardType="numeric"
            containerStyle={[s.inputContainer, inputContainerStyle, { width: CARD_NUMBER_INPUT_WIDTH, borderBottomColor: status['number'] === "invalid" ? "#FC6068" : "#E1E3E6" }]} >
            </CCInput>
            <View testID='anchor' style={{position: 'relative', width:'100%', height:0 ,overflow:'visible'}} >
              <Image style={s.icon,{position: 'absolute',top: -40, right: 40 ,width: 50, height: 30,}} source={Icons[this._iconToShow()]} />
            </View>
            {status['number'] === "invalid" && <Text style={{color: '#FC6068',paddingTop: 5}}>{invalidMessage.number}</Text>}
          <CCInput {...this._inputProps("expiry")}
            keyboardType="numeric"
            containerStyle={[
              s.inputContainer,
              inputContainerStyle,
              {
                width: CARD_NUMBER_INPUT_WIDTH,
                borderBottomColor: status['expiry'] === "invalid" ? "#FC6068" : "#E1E3E6" }]
              }
            />
            {status['expiry'] === "invalid" && <Text style={{color: '#FC6068',paddingTop: 5}}>{invalidMessage.expiry}</Text>}
          { requiresCVC &&
            <CCInput {...this._inputProps("cvc")}
              keyboardType="numeric"
              containerStyle={[s.inputContainer, inputContainerStyle, { width: CARD_NUMBER_INPUT_WIDTH, borderBottomColor: status['cvc'] === "invalid" ? "#FC6068" : "white"}]} /> }
              <View testID='anchor' style={{position: 'relative', width:'100%', height: 0, overflow: 'visible'}} >
                <Image style={s.icon,{position: 'absolute',top: -40, right: 40 ,width: 50, height: 30,}} source={Icons['cvc']} />
              </View>
              {status['cvc'] === "invalid" && <Text style={{color: '#FC6068',paddingTop: 5}}>{invalidMessage.cvc}</Text>}
          { requiresName &&
            <CCInput {...this._inputProps("name")}
              containerStyle={[s.inputContainer, inputContainerStyle, { width: CARD_NUMBER_INPUT_WIDTH }]} /> }
          { requiresPostalCode &&
            <CCInput {...this._inputProps("postalCode")}
              keyboardType="numeric"
              containerStyle={[s.inputContainer, inputContainerStyle, { width: POSTAL_CODE_INPUT_WIDTH }]} /> }
        </ScrollView>
      </View>
    );
  }
}
