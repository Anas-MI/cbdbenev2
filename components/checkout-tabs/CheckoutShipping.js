import TitleList from "../TitleList"
import Button from "../form-components/Button"
import { Form, Radio } from "antd"
import { connect } from 'react-redux'
import regex from "../../services/helpers/regex"
import Input from '../form-components/Input'
import Checkbox from '../form-components/Checkbox';
import { showRegBar } from '../../redux/actions/drawers'
import validator from "../../services/helpers/validator";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import projectSettings from '../../constants/projectSettings';
import { searchAddress, getShippingRates } from '../../services/api';
import { getItemsHeightWidth, filterShippingRates } from "../../services/helpers/cart"
import { getSingleElementByMultipleObject } from "../../services/helpers/misc"
import msgStrings from "../../constants/msgStrings"
import { 
  setShippingCharge,
  setShippingType } from '../../redux/actions/cart'


class CheckoutShipping extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: props.email,
      address: props.address,
      shippingErrMsg: null,
      shippingRates: [],
      shippingSendData: null,
    }
  }
  componentDidMount() {
    // getShippingRates
    console.log({
      cart: this.props.cart
    })
    this.getRates()
  }
  getRates = () => {
    const data = this.getShippingData()
    const {
      cart
    } = this.props
    getShippingRates(data)
      .then(res => {
        console.log({ res })

        if (res.data.status) {
          const rates = res.data.data.rates
          const errMessages = res.data.data.messages
          const breakData = getSingleElementByMultipleObject(
            rates,
            c => c.carrier
          );
          const isUspsRates = rates.some(el => el.carrier === "USPS")
          const uspsRates = isUspsRates ? rates.filter(
            el => el.carrier === "USPS"
          ) : rates;
          const shippingOptions = filterShippingRates(uspsRates)
            .sort((a, b) => a.rate - b.rate);
          const shippingOptionsNew = shippingOptions.map(el => {
            if (projectSettings.shippingFreeAfter < cart.subTotal) {
              if (el.customName === "Standard") {
                return {
                  ...el,
                  customRate: 0
                };
              }
            }
            return el;
          });
          const objectOffKeys = Object.keys(breakData);
          const shippingWrongZip = errMessages && errMessages.find(el => el.message === "to postal code: zipcode format must be zzzzz[pppp]")

          if (errMessages &&
            shippingWrongZip && shippingWrongZip.message === "to postal code: zipcode format must be zzzzz[pppp]"
          ) {
            let msg = "";
            switch (shippingWrongZip.message) {
              case "to postal code: zipcode format must be zzzzz[pppp]":
                msg = msgStrings.INVALID_ZIP;
                break;
              default:
                msg = errMessages[0].message;
            }
            this.setState({
              shippingErrMsg: msg
            });
          } else if (rates && rates.length) {
            this.setState(
              {
                shippingErrMsg: null,
                shippingBreakData: breakData,
                shippingCarrier: objectOffKeys,
                shippingAllData: rates,
                shippingAllResponse: res.data.data,
                shippingRates: shippingOptionsNew // breakData[firstKey]
              },
              () => {
                if (shippingOptionsNew.length > 0) {
                  // this.handleShippingTypeChange(shippingOptionsNew[0]);
                }
                else {
                  this.setState({
                    shippingErrMsg: msgStrings.NO_SHIPMENT
                  });
                }
              }
            );
          }

          setTimeout(() => {
            console.log({
              state: this.state
            })
          }, 1000);
        }
      })
      .catch(console.log)
  }
  getShippingData = () => {
    const { cart } = this.props;
    const { address: {
      firstname, lastname, city, state, zip, addressStr, phone,
      country,
    } } = this.state;
    const dimension = getItemsHeightWidth(cart.items);
    const data = {
      city,
      state,
      zip,
      country,
      phone,
      name: firstname + " " + lastname,
      street: addressStr,
      length: dimension.length,
      width: dimension.width,
      height: dimension.height,
      weight: dimension.weight
    };
    return data
  }
  onSubmit = e => {
    e.preventDefault()
    const {
      onSubmit
    } = this.props
    const {
      shippingSendData
    } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log({
          values
        })
        if (typeof onSubmit === "function") {
          onSubmit(e, values, shippingSendData)
        }
      }
    })
  }
  changeShippingMethod = (method)=> {
    const {
      customRate, id, service
    } = method
    const { setShippingCharge, setShippingType } = this.props;
    const shippingType = service;
    const { id: shpId } = this.state.shippingAllResponse;
    const shippingCharge = parseFloat(customRate);

    this.setState({
      shippingSendData: {
        shipmentid: shpId,
        rate: id
      },
    })
    setShippingCharge(
      shippingCharge,
      this.props.cart,
    );
    setShippingType(shippingType, this.props.cart);
      setTimeout(() => {
        console.log({
          cart: this.props.cart
        })
      }, 1000);
  }
  render() {
    const componentClass = "c-checkout-shipping"
    const {
      email, address, shippingRates
    } = this.state
    const {
      form
    } = this.props
    const { getFieldDecorator } = form
    return (
      <div className={componentClass}>
        <Form onSubmit={this.onSubmit} >
          <TitleList versions={["sm-border"]} parentClass={componentClass} title="Contact" >
            <Form.Item>
              {getFieldDecorator('email', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your E-mail!'
                  },
                  {
                    pattern: regex.email,
                    message: 'Please enter a valid E-mail!'
                  },
                ],
                initialValue: email
              })(
                <Input label="E-mail" />,
              )}
            </Form.Item>
          </TitleList>
          <TitleList versions={["sm-border"]} parentClass={componentClass} title="Ship to" >
            <Form.Item>
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your Address!'
                  },
                ],
                initialValue: address.addressStr
              })(
                <Input label="address" />,
              )}
            </Form.Item>
          </TitleList>
          <TitleList versions={["sm-border"]} parentClass={componentClass} title="Shipping Method" >
            <Form.Item>
              {shippingRates.length > 0 && getFieldDecorator('shippingMethod', {
                initialValue: shippingRates[0]
              })(
                <Radio.Group
                className="bordered"
                onChange={(e)=> {
                  const {
                    value
                  } = e.target
                  this.changeShippingMethod(value)
                }}
                >
                  {
                    shippingRates.map((el, i)=> <Radio key={i} value={el}>{el.customRate} ({el.customName})</Radio>)
                  }
                </Radio.Group>
              )}
            </Form.Item>
          </TitleList>
          <TitleList versions={["sm-border"]} parentClass={componentClass}  >
            <Button parentClass="c-checkout" type="submit" theme="outline" versions={["block"]} >Continue to Shipping</Button>
          </TitleList>
        </Form>


      </div>
    )
  }
}

CheckoutShipping.defaultProps = {
  address: {}
}

const mapStateToProps = (state) => ({
  user: state.user,
  cart: state.cart
})
const mapActionToProps = {
  // showRegBar
  setShippingCharge,
  setShippingType
}
export default connect(mapStateToProps, mapActionToProps)(Form.create({ name: "checkoutShipping" })(CheckoutShipping))