import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'tss-react/mui'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import auth from './../auth/auth-helper'
import PostList from './PostList'
import { listNewsFeed } from './api-post.jsx'
import NewPost from './NewPost'

const styles = theme => ({
  card: {
    margin: 'auto',
    paddingTop: 0,
    paddingBottom: theme.spacing(3)
  },
  title: {
    padding: `${theme.spacing(3)} ${theme.spacing(2.5)} ${theme.spacing(2)}`,
    color: theme.palette.openTitle,
    fontSize: '1em'
  }
})

class Newsfeed extends Component {
  state = {
    posts: []
  }

  loadPosts = () => {
    const jwt = auth.isAuthenticated()
    listNewsFeed(
      { userId: jwt.user._id },
      { t: jwt.token }
    ).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.setState({ posts: data })
      }
    })
  }

  componentDidMount = () => {
    this.loadPosts()
  }

  addPost = (post) => {
    const updatedPosts = this.state.posts
    updatedPosts.unshift(post)
    this.setState({ posts: updatedPosts })
  }

  removePost = (post) => {
    const updatedPosts = this.state.posts
    const index = updatedPosts.indexOf(post)
    updatedPosts.splice(index, 1)
    this.setState({ posts: updatedPosts })
  }

  render() {
    const { classes } = this.props
    return (
      <Card className={classes.card}>
        <Typography variant="h6" className={classes.title}>
          Newsfeed
        </Typography>
        <Divider/>
        <NewPost addUpdate={this.addPost}/>
        <Divider/>
        <PostList removeUpdate={this.removePost} posts={this.state.posts}/>
      </Card>
    )
  }
}

Newsfeed.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(Newsfeed, styles)

