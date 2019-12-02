import {Form, Radio as AntRadio } from 'antd'
import Input from '../form-components/Input';
import Button from '../form-components/Button';
import { contactUs } from '../../services/api';
class Contact extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isLoading: false
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if(!err){
                console.log({values})
                contactUs(values)
                .then(res => {
                    console.log({
                        res
                    })
                })
                .catch(console.log)
            }
        })
    }
    render (){
        const {
            Item
        } = Form
        const {
            getFieldDecorator
        } = this.props.form
        const {
            isLoading
        } = this.state
        return (
            <div className="c-contact-form">
                <Form onSubmit={this.onSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <Item>
                                {getFieldDecorator('subject', {
                                    initialValue: "Order Enquiry",
                                })(
                                    <AntRadio.Group >
                                        <AntRadio className="c-contact-form__radio" value="Order Enquiry">
                                            <b>Order Enquiry</b>
                                            <br />
                                            Questions about an order you have placed online.
                                        </AntRadio>
                                        <AntRadio className="c-contact-form__radio" value="Product Enquiry">
                                            <b>Product Enquiry</b>
                                            <br />
                                            Questions you may have about specific products and ingredients.
                                        </AntRadio>
                                        <AntRadio className="c-contact-form__radio" value="Wholesale Enquiry">
                                            <b>Wholesale Enquiry</b>
                                            <br />
                                            Questions about distributing Bené CBD.
                                        </AntRadio>
                                        <AntRadio className="c-contact-form__radio" value="Press and Marketing Enquiry">
                                            <b>Press and Marketing Enquiry</b>
                                            <br />
                                            Questions you may have about press and marketing opportunities
                                        </AntRadio>
                                        <AntRadio className="c-contact-form__radio c-contact-form__radio--last" value="General Feedback or Questions">
                                            <b>General Feedback or Questions</b>
                                            <br />
                                            Please contact us with any general questions or thoughts.
                                        </AntRadio>
                                    </AntRadio.Group>
                                )}
                            </Item>
                        </div>
                        <div className="col-md-6">
                            <div className="c-contact-form__main-form">
                                <Item>
                                    {getFieldDecorator('name', {
                                        rules: [
                                            { required: true, message: 'Please input your name!' }
                                        ],
                                    })(
                                        <Input versions={["light"]} parentClass="c-contact-form" label="Name" />
                                    )}
                                </Item>
                                <Item>
                                    {getFieldDecorator('email', {
                                        rules: [
                                            { required: true, message: 'Please input your e-mail!' }
                                        ],
                                    })(
                                        <Input versions={["light"]} parentClass="c-contact-form" label="E-mail" />
                                    )}
                                </Item>
                                <Item>
                                    {getFieldDecorator('text', {
                                        rules: [
                                            { required: true, message: 'Please input your message!' }
                                        ],
                                    })(
                                        <Input versions={["light"]} parentClass="c-contact-form" label="Message" />
                                    )}
                                </Item>
                                <Button theme='outline' type="submit" disabled={isLoading} versions={["block"]} >Send E-mail</Button>
                            </div>
                            <div className="c-contact-form__info-block">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="c-contact-form__text">Our Phone Number</p>
                                    </div>
                                    <div className="col-md-6">
                                        <a href="tel:+16463673725" className="c-contact-form__link">+1 (646) 367-3725</a>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="c-contact-form__text">Our E-mail</p>
                                    </div>
                                    <div className="col-md-6">
                                        <a href="mailto:support@cbdbene.com" className="c-contact-form__link">support@cbdbene.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>            
        )
    }
}
const ContactFrom = Form.create({name: "contact"})(Contact)

export default ContactFrom