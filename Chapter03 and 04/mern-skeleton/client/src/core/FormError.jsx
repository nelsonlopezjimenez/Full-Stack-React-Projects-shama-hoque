import Typography from '@mui/material/Typography'
import ErrorIcon from '@mui/icons-material/Error'

// The red error line under a form (Signin, Signup, EditProfile repeated it in the book).
// [BEGINNER] Destructuring in the parameter list: ({ message }) reads props.message.
// Returning null renders nothing.
// [ADVANCED] The book used <Icon>error</Icon>, a ligature from the Material Icons web font
// (loaded from Google in template.js). An SVG icon component needs no font download.
const FormError = ({ message }) => {
  if (!message) return null
  return (
    // role="alert" makes screen readers announce the message as soon as it appears
    <Typography role="alert" sx={{ color: 'error.main', mt: 1 }}>
      <ErrorIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
      {message}
    </Typography>
  )
}

export default FormError
