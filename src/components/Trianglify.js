import React from 'react'
import PropTypes from 'prop-types'
import Pattern from 'trianglify'

const Trianglify = React.memo(({ title }) => {
  if (typeof window === 'undefined') {
    return null
  }
  const src = window.URL.createObjectURL(
    dataURItoBlob(
      Pattern({
        width: window.innerWidth,
        height: window.innerHeight,
        seed: title
      }).toCanvas().toDataURL()
    )
  )
  return <img 
          src={src} 
          aria-hidden='true' 
          style={{
            position: `absolute`,
            top: `0`,
            left: `0`,
            width: `100%`,
            height: `100%`,
            objectFit: `cover`,
            objectPosition: `center`,
            zIndex: `-1000`,
            alt: `alt`
          }}
        />
})

Trianglify.propTypes = {
  title: PropTypes.string
}

export default Trianglify

// https://gist.github.com/davoclavo/4424731
function dataURItoBlob (dataURI) {
  // convert base64 to raw binary data held in a string
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var arrayBuffer = new ArrayBuffer(byteString.length)
  var _ia = new Uint8Array(arrayBuffer)
  for (var i = 0; i < byteString.length; i++) {
    _ia[i] = byteString.charCodeAt(i)
  }

  var dataView = new DataView(arrayBuffer)
  var blob = new Blob([dataView], { type: mimeString })
  return blob
}