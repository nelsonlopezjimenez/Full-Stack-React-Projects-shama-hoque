import Typography from '@mui/material/Typography'
import ErrorIcon from '@mui/icons-material/Error'

const FormError = ({ message }) => {
  if (!message) return null
  return (
    <Typography role="alert" sx={{ color: 'error.main', mt: 1 }}>
      <ErrorIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
      {message}
    </Typography>
  )
}

export default FormError
