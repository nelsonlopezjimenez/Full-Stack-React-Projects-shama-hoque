import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'tss-react/mui'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Person from '@mui/icons-material/Person'
import { Link } from 'react-router-dom'
import { list } from './api-user.jsx'

const styles = theme => ({
  root: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: theme.spacing(5)
  },
  title: {
    margin: `${theme.spacing(4)} 0 ${theme.spacing(2)}`,
    color: theme.palette.openTitle
  }
})

class Users extends Component {
  state = {
    users: []
  }

  componentDidMount() {
    list().then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.setState({ users: data })
      }
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.root} elevation={4}>
        <Typography variant="h6" className={classes.title}>
          All Users
        </Typography>
        <List dense>
          {this.state.users.map((item, i) => (
            <ListItem
              key={i}
              secondaryAction={
                <IconButton>
                  <ArrowForward/>
                </IconButton>
              }
            >
              <ListItemButton component={Link} to={'/user/' + item._id}>
                <ListItemAvatar>
                  <Avatar>
                    <Person/>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.name}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    )
  }
}

Users.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(Users, styles)

