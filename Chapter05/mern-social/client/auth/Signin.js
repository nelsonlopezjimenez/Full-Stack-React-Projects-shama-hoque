import React, { Component } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Icon from '@mui/material/Icon'
import PropTypes from 'prop-types'
import { withStyles } from '@mui/material/styles'
import auth from './../auth/auth-helper'
import { signin } from './api-auth.js'
import { withRouter } from './../withRouter'

const styles = theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
})

class Signin extends Component {
  state = {
    email: '',
    password: '',
    error: ''
  }

  clickSubmit = () => {
    const user = {
      email: this.state.email || undefined,
      password: this.state.password || undefined
    }
    signin(user).then((data) => {
      if (data.error) {
        this.setState({ error: data.error })
      } else {
        auth.authenticate(data, () => {
          const from = (this.props.location.state && this.props.location.state.from)
            || { pathname: '/' }
          this.props.history.push(from.pathname || from)
        })
      }
    })
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  render() {
    const { classes } = this.props
    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h5" component="h2" className={classes.title}>
            Sign In
          </Typography>
          <TextField
            id="email"
            type="email"
            label="Email"
            className={classes.textField}
            value={this.state.email}
            onChange={this.handleChange('email')}
            margin="normal"
          /><br/>
          <TextField
            id="password"
            type="password"
            label="Password"
            className={classes.textField}
            value={this.state.password}
            onChange={this.handleChange('password')}
            margin="normal"
          />
          <br/>
          {this.state.error && (
            <Typography component="p" color="error">
              <Icon color="error" className={classes.error}>error</Icon>
              {this.state.error}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            variant="contained"
            onClick={this.clickSubmit}
            className={classes.submit}
          >
            Submit
          </Button>
        </CardActions>
      </Card>
    )
  }
}

Signin.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withRouter(withStyles(styles)(Signin))

