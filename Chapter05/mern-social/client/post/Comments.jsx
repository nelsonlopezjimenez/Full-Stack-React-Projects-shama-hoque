import React, { Component } from 'react'
import auth from './../auth/auth-helper'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Icon from '@mui/material/Icon'
import PropTypes from 'prop-types'
import { withStyles } from 'tss-react/mui'
import { comment, uncomment } from './api-post.jsx'
import { Link } from 'react-router-dom'

const styles = theme => ({
  cardHeader: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  smallAvatar: {
    width: 25,
    height: 25
  },
  commentField: {
    width: '96%'
  },
  commentText: {
    backgroundColor: 'white',
    padding: theme.spacing(1),
    margin: `2px ${theme.spacing(2)} 2px 2px`
  },
  commentDate: {
    display: 'block',
    color: 'gray',
    fontSize: '0.8em'
  },
  commentDelete: {
    fontSize: '1.6em',
    verticalAlign: 'middle',
    cursor: 'pointer'
  }
})

class Comments extends Component {
  state = { text: '' }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  addComment = (event) => {
    if (event.keyCode === 13 && event.target.value) {
      event.preventDefault()
      const jwt = auth.isAuthenticated()
      comment(
        { userId: jwt.user._id },
        { t: jwt.token },
        this.props.postId,
        { text: this.state.text }
      ).then((data) => {
        if (data.error) {
          console.log(data.error)
        } else {
          this.setState({ text: '' })
          this.props.updateComments(data.comments)
        }
      })
    }
  }

  deleteComment = commentItem => event => {
    const jwt = auth.isAuthenticated()
    uncomment(
      { userId: jwt.user._id },
      { t: jwt.token },
      this.props.postId,
      commentItem
    ).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.props.updateComments(data.comments)
      }
    })
  }

  render() {
    const { classes } = this.props
    const commentBody = item => (
      <p className={classes.commentText}>
        <Link to={'/user/' + item.postedBy._id}>{item.postedBy.name}</Link><br/>
        {item.text}
        <span className={classes.commentDate}>
          {(new Date(item.created)).toDateString()} |
          {auth.isAuthenticated().user._id === item.postedBy._id && (
            <Icon onClick={this.deleteComment(item)} className={classes.commentDelete}>delete</Icon>
          )}
        </span>
      </p>
    )

    return (
      <div>
        <CardHeader
          avatar={
            <Avatar
              className={classes.smallAvatar}
              src={'/api/users/photo/' + auth.isAuthenticated().user._id}
            />
          }
          title={
            <TextField
              onKeyDown={this.addComment}
              multiline
              value={this.state.text}
              onChange={this.handleChange('text')}
              placeholder="Write something ..."
              className={classes.commentField}
              margin="normal"
            />
          }
          className={classes.cardHeader}
        />
        {this.props.comments.map((item, i) => (
          <CardHeader
            key={i}
            avatar={
              <Avatar
                className={classes.smallAvatar}
                src={'/api/users/photo/' + item.postedBy._id}
              />
            }
            title={commentBody(item)}
            className={classes.cardHeader}
          />
        ))}
      </div>
    )
  }
}

Comments.propTypes = {
  classes: PropTypes.object.isRequired,
  postId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
  updateComments: PropTypes.func.isRequired
}

export default withStyles(Comments, styles)

