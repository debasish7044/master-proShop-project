import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckOutSteps from '../components/CheckOutSteps'
import { createOrder } from '../actions/orderActions'

const PlaceOrderScreen = ({ history }) => {
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
  }

  // calculate prices
  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => {
      return acc + item.price * item.qty
    }, 0)
  )

  cart.shippingPrice = cart.itemsPrice > 100 ? 100 : 0
  cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)))
  cart.totalPrice = addDecimals(
    Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)
  )

  const orderCreate = useSelector((state) => state.orderCreate)
  const { order, success, error } = orderCreate

  useEffect(() => {
    if (success) {
      history.push(`order/${order._id}`)
    }
  }, [history, success])

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        taxPrice: cart.taxPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
      })
    )
  }

  return (
    <>
      <CheckOutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h3>Shipping</h3>
              <p>
                <strong>Address</strong>
              </p>
              {cart.shippingAddress.address},{cart.shippingAddress.city},
              {cart.shippingAddress.postalCode},{cart.shippingAddress.country}
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Payment Method</h3>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </ListGroup.Item>
            <ListGroup.Item>
              <h3>Order Items</h3>
              {cart.cartItems.length === 0 ? (
                <Message>Your Cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((x, i) => {
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
                            {x.price} × {x.qty} = $
                            {addDecimals(x.price * x.qty)}
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
                  <Col>Items</Col>${cart.itemsPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>${cart.shippingPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax Price</Col>${cart.taxPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>${cart.totalPrice}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && <Message variant='danger'>{error}</Message>}
              </ListGroup.Item>
              <ListGroup.Item>
                <Button
                  type='button'
                  className='btn-block'
                  disabled={cart.cartItems === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PlaceOrderScreen
