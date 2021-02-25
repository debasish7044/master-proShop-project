import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PayPalButton } from 'react-paypal-button-v2'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import axios from 'axios'
import {
  getOrderDetails,
  payOrder,
  deliveredOrder,
} from '../actions/orderActions'
import { ORDER_PAY_RESET } from '../constants/orderConstant'
import { ORDER_DELIVERED_RESET } from '../constants/orderConstant'

const OrderScreen = ({ match, history }) => {
  const dispatch = useDispatch()
  const [sdkReady, setSdkReady] = useState(false)

  const orderId = match.params.id

  const cart = useSelector((state) => state.cart)
  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, loading, error } = orderDetails

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDelivered = useSelector((state) => state.orderDelivered)
  const {
    loading: loadingDelivered,
    success: successDelivered,
  } = orderDelivered

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    }

    const addPaypalToScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paypal')
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
      script.async = true
      script.onload = () => setSdkReady(true)
      document.body.appendChild(script)
    }

    if (!order || successPay || successDelivered) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVERED_RESET })
      dispatch(getOrderDetails(orderId))
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPaypalToScript()
      }
    } else {
      setSdkReady(true)
    }
  }, [dispatch, orderId, successPay, order, successDelivered])

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult))
  }

  const deliveredHandler = () => {
    dispatch(deliveredOrder(order))
  }

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      <h3>Order {order._id}</h3>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h3>Shipping</h3>
              <div>
                <strong>Name:</strong> {order.user.name}
              </div>
              <div>
                <strong>Email:</strong>
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </div>
              <div>
                <strong>Address</strong>
              </div>
              {order.shippingAddress.address},{order.shippingAddress.city},
              {order.shippingAddress.postalCode},{order.shippingAddress.country}
              <div className='mt-3'>
                {order.isDelivered ? (
                  <Message variant='success'>
                    Delivered {order.deliveredAt}
                  </Message>
                ) : (
                  <Message variant='danger'>Not Delivered</Message>
                )}
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Payment Method</h3>
              <div className='mb-3'>
                <strong>Method: </strong>
                {order.paymentMethod}
              </div>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Order Items</h3>
              {order.orderItems.length === 0 ? (
                <Message>Your Cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((x, i) => {
                    return (
                      <ListGroup.Item key={i}>
                        {' '}
                        <Row>
                          <Col md={1}>
                            <Image src={x.image} alt={x.name} fluid rounded />
                          </Col>
                          <Col>
                            <Link to={`/product/${x.product}`}>{x.name}</Link>
                          </Col>
                          <Col md={4}>
                            {x.price} × {x.qty} = ${Math.floor(x.price * x.qty)}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    )
                  })}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup>
              <ListGroup.Item>
                <h3>Order Summary</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>${order.itemsPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>${order.shippingPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax Price</Col>${order.taxPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>${order.totalPrice}
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalButton
                      amount={order.totalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )}
                </ListGroup.Item>
              )}
              {loadingDelivered && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliveredHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen
