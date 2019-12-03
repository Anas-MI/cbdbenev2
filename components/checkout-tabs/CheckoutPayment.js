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
import { searchAddress, getShippingRates, confirmShipment, authorizeCharge, authorizeSubscriptionBank, authorizeSubscriptionProfile, authorizeSubscription, placeOrderNew } from '../../services/api';
import { getItemsHeightWidth, filterShippingRates, generateOrderObj } from "../../services/helpers/cart"
import { getSingleElementByMultipleObject } from "../../services/helpers/misc"
import msgStrings from "../../constants/msgStrings"
import {
    setShippingCharge,
    setShippingType
} from '../../redux/actions/cart'

class CheckoutPayment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: props.email,
            address: props.address,
            shippingDetail: props.shippingDetail,
        }
        this.generateOrder = this.generateOrder.bind(this)
    }

    combinePromiseProduct = (promise, el) =>
        new Promise(res => {
            promise
                .then(resX => {
                    if (resX.data.status) {
                        res({
                            ...el,
                            subscriptionFailed: false,
                            subscriptionId: resX.data.subscriptionid
                        });
                    } else {
                        res({
                            ...el,
                            subscriptionFailed: true
                        });
                    }
                })
                .catch(resX => {
                    res({
                        ...el,
                        subscriptionFailed: true
                    });
                });
        });

    generateSubsData = (el, details) => {
        const customAmount = parseFloat(el.subTotal); // + (Math.random() * 100)
        const {
            billto,
            profileid,
            paymentid,
            cardnumber,
            cardcode,
            expiry
        } = details;
        console.log({
            details
        });
        const subsData = {
            amount: parseFloat(customAmount.toFixed(2)),
            name: billto.firstName + billto.lastName,
            schedule: {
                interval: {
                    length: "1",
                    unit: "months"
                },
                startDate: moment().format("YYYY-MM-DD"),
                totalOccurrences: el.subscriptionMeta.duration || "1"
            },
            billto: {
                firstName: billto.firstName,
                lastName: billto.lastName
            }
        };
        if (profileid && paymentid) {
            return {
                ...subsData,
                profileid,
                paymentid
            };
        }
        if (cardnumber && cardcode && expiry)
            return {
                ...subsData,
                cardnumber,
                cardcode,
                expiry
            };
    };
    makeSubsPromise = (order, details) => {
        return order.products.map(el => {
            if (el.isSubscribed) {
                const subsData = this.generateSubsData(el, details);
                if (subsData.routingNumber) {
                    return this.combinePromiseProduct(
                        authorizeSubscriptionBank(subsData),
                        el
                    );
                }
                if (subsData.profileid) {
                    return this.combinePromiseProduct(
                        authorizeSubscriptionProfile(subsData),
                        el
                    );
                }
                return this.combinePromiseProduct(
                    authorizeSubscription(subsData),
                    el
                );
            } else {
                return new Promise(res => {
                    res(el);
                });
            }
        });
    };
    finalOrderSubmit = orderApi => {
        orderApi
          .then(res => {
            const resJson = res.data
            if (resJson.status) {
                alert("success")
              this.setState(
                {
                  modalData: "orderPlacedSuccessfully",
                  modalTitle: "orderPlacedModalTitle",
                  modal: true,
                  clearCart: true,
                  SpinnerToggle: false
                },
                () => {
                  this.modalDismiss();
                  const {
                    history,
                    location,
                    user: {
                      userMetaId
                    }
                  } = this.props
                //   clearCart();
                //   history.push({
                //     pathname:  "/order-success",
                //     state: {
                //       order: resJson.data
                //     }
                //   })
                }
              );
            } else {
              console.log(resJson);
              alert("failed")
            //   this.setState({
            //     modalData: someThingWrong,
            //     modalTitle: wrongModalTitle,
            //     modal: true,
            //     SpinnerToggle: false
            //   });
            }
          })
          .catch(err => {
            console.log({
              err
            });
            this.setState({
              modalData: someThingWrong,
              modalTitle: wrongModalTitle,
              modal: true,
              SpinnerToggle: false
            });
          });
      };
    onSubmit = e => {
        e.preventDefault()
        const {
            onSubmit, shippingSendData, address
        } = this.props
        console.log({
            cart: this.props
        })
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log({
                    values
                })
                confirmShipment({
                    ...shippingSendData
                })
                    .then(res => {
                        if (res.data.status && res.data.data) {
                            this.setState({
                                confirmShipRes: res.data.data
                            }, () => {
                                const order = this.generateOrder()
                                console.log({
                                    order
                                })
                                order.then(order => {
                                    const {
                                        cardnumber,
                                        cvv,
                                        cardname,
                                        expiry: expDate
                                    } = values
                                    console.log({
                                        order
                                    })
                                    const expiry = "20" + expDate
                                        .split("/")
                                        .reverse()
                                        .join("-");
                                    const {
                                        grandTotal: amount,
                                        countryTax,
                                        userDetails,
                                        shippingCharge,
                                        products
                                    } = order;
                                    const customAmount = amount;
                                    const {
                                        addressStr,
                                        state,
                                        ...addressRest
                                    } = address
                                    const data = {
                                        cardnumber,
                                        expiry,
                                        cardcode: cvv,
                                        amount: parseFloat(customAmount.toFixed(2)),
                                        tax: {
                                            amount: countryTax,
                                            name: `Country Tax - ${userDetails.country}`
                                        },
                                        shipping: {
                                            amount: shippingCharge,
                                            name: `Ship to - ${userDetails.state}`
                                        },
                                        lineItems: products.map(el => ({
                                            itemId: el.itemId,
                                            name: el.title,
                                            description: "-",
                                            quantity: el.qty,
                                            unitPrice: el.unitPrice
                                        })),
                                        billto: {
                                            address: addressStr,
                                            company: "",
                                            firstName: "",
                                            lastName: "",
                                            ...addressRest
                                        },
                                        shipTo: {
                                            address: addressStr,
                                            ...addressRest
                                        }
                                    };

                                    authorizeCharge(data)
                                        .then(res => {
                                            console.log({ res });
                                            if (res.data.status) {
                                                const transactionId = res.data.transactionid
                                                Promise.all(this.makeSubsPromise(order, data)).then(res => {
                                                    console.log({ res });
                                                    const sendAbleOrder = {
                                                      ...order,
                                                      products: res,
                                                      transactionId
                                                    };
                                                    // basicFunction.exportToJson(sendAbleOrder)
                                                    this.finalOrderSubmit(placeOrderNew(sendAbleOrder));
                                                  });
                                            }else{
                                                alert("failed")
                                            }
                                        })
                                        .catch(err => {
                                            console.log({err})
                                            alert("failed")
                                        })
                                })
                            })
                        }
                    })
                    .catch(console.log)
                // if (typeof onSubmit === "function") {
                //     const order = generateOrder()
                //     console.log({
                //         order
                //     })
                //     order.then(res => console.log({res}))
                //     // onSubmit(e, values, address, addressShip)
                // }
            }
        })
    }
    async generateOrder(paymentResponse, isFirst = true) {
        let confirmShipRes = this.state.confirmShipRes;
        const { shippingSendData, cart, user, referrer,
            address
        } = this.props;
        // if(isFirst){
        //     await confirmShipment({
        //         ...shippingSendData
        //     })
        //     .then(res => {
        //         if(res.data.status && res.data.data){
        //             this.setState({
        //                 confirmShipRes: res.data.data
        //             })
        //         }
        //     })
        //     .catch(console.log)
        // }
        const refId = referrer && referrer.referralUrlId;
        const {
            id: shipmentid,
            selected_rate,
            postage_label,
            tracking_code: trackingcode,
            tracker,
            fees
        } = confirmShipRes || {};
        const shippingDetails = {
            shipmentid,
            rateid: selected_rate && selected_rate.id,
            rate: selected_rate && selected_rate.rate,
            label: postage_label && postage_label.label_url,
            trackingcode,
            trackerid: tracker && tracker.id,
            fees,
            service: selected_rate && selected_rate.service,
            carrier: (selected_rate && selected_rate.carrier) || "shipment_failed"
        };
        const order = generateOrderObj({
            referralId: null,
            cart, user, confirmShipRes,
            stateObj: {
                paymentMethod: "Authorize",
                address
            }
        })
        return order
    }
    render() {
        const componentClass = "c-checkout-payment"
        const {
            form
        } = this.props
        const {
            email, address, shippingDetail
        } = this.state
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
                    <TitleList versions={["sm-border"]} parentClass={componentClass} title="Method" >
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
                    <TitleList parentClass={componentClass} title="Pay with card" >
                        <Form.Item>
                            {getFieldDecorator('cardnumber', {
                                rules: [{
                                    required: true,
                                    message: "Please enter your card number!"
                                }]
                            })(
                                <Input label="Card Number" />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('cardname', {
                                rules: [{
                                    required: true,
                                    message: "Please enter cardholder name!"
                                }]
                            })(
                                <Input label="Cardholder Name" />,
                            )}
                        </Form.Item>
                        <div className="container-fluid p-0">
                            <div className="row">
                                <div className="col-8">
                                    <Form.Item>
                                        {getFieldDecorator('expiry', {
                                            rules: [{
                                                required: true,
                                                message: "Please enter expiration date!"
                                            }]
                                        })(
                                            <Input label="Expiration Date*(mm/yy)" />,
                                        )}
                                    </Form.Item>
                                </div>
                                <div className="col-4">
                                    <Form.Item>
                                        {getFieldDecorator('cvv', {
                                            rules: [{
                                                required: true,
                                                message: "Please enter cvv number!"
                                            }]
                                        })(
                                            <Input label="CVV Code" />,
                                        )}
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        <Form.Item>
                            {getFieldDecorator('savecard', {
                                valuePropName: 'checked',
                                initialValue: false,
                            })(<Checkbox versions={["gold"]} >Save this card for next time</Checkbox>)}
                        </Form.Item>
                    </TitleList>
                    <TitleList versions={["sm-border"]} parentClass={componentClass} title="Pay with account" >
                        <Form.Item>
                            {getFieldDecorator('name_acc', {
                                // rules: [{
                                //     required: true,
                                //     message: "Please enter your name!"
                                // }]
                            })(
                                <Input label="Name on Account" />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('bank_routing_number', {
                                // rules: [{
                                //     required: true,
                                //     message: "Please enter routing number!"
                                // }]
                            })(
                                <Input label="Bank Routing Number*" />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('bank_checking_number', {
                                // rules: [{
                                //     required: true,
                                //     message: "Please enter checking account number!"
                                // }]
                            })(
                                <Input label="Checking Account Number*" />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('account_type', {
                                // rules: [{
                                //     required: true,
                                //     message: "Please enter account type!"
                                // }]
                            })(
                                <Input label="Account Type*" />,
                            )}
                        </Form.Item>
                    </TitleList>
                    <Button parentClass="c-checkout" theme="outline" versions={["block"]} >Place order</Button>

                </Form>

            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    cart: state.cart
})
const mapActionToProps = {
}

export default connect(mapStateToProps, mapActionToProps)(Form.create({ name: "CheckoutPayment" })(CheckoutPayment))