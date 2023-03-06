import styled from 'styled-components'

const LoadingPadContainer = styled.div`{
  .spinftw {
      border-radius: 100%;
      display: inline-block;
      height: 30px;
      width: 30px;
      top: 50%;
      position: absolute;
      -webkit-animation: loader infinite 2s;
      -moz-animation: loader infinite 2s;
      animation: loader infinite 2s;
      box-shadow: 25px 25px #3498db, -25px 25px #c0392b, -25px -25px #f1c40f, 25px -25px #27ae60;
      background-size: contain;
      
  }

  @-webkit-keyframes loader {
      0%,
      100% {
          box-shadow: 25px 25px #3498db, -25px 25px #c0392b, -25px -25px #f1c40f, 25px -25px #27ae60;
      }
      25% {
          box-shadow: -25px 25px #3498db, -25px -25px #c0392b, 25px -25px #f1c40f, 25px 25px #27ae60;
      }
      50% {
          box-shadow: -25px -25px #3498db, 25px -25px #c0392b, 25px 25px #f1c40f, -25px 25px #27ae60;
      }
      75% {
          box-shadow: 25px -25px #3498db, 25px 25px #c0392b, -25px 25px #f1c40f, -25px -25px #27ae60;
      }
  }

  @-moz-keyframes loader {
      0%,
      100% {
          box-shadow: 25px 25px #3498db, -25px 25px #c0392b, -25px -25px #f1c40f, 25px -25px #27ae60;
      }
      25% {
          box-shadow: -25px 25px #3498db, -25px -25px #c0392b, 25px -25px #f1c40f, 25px 25px #27ae60;
      }
      50% {
          box-shadow: -25px -25px #3498db, 25px -25px #c0392b, 25px 25px #f1c40f, -25px 25px #27ae60;
      }
      75% {
          box-shadow: 25px -25px #3498db, 25px 25px #c0392b, -25px 25px #f1c40f, -25px -25px #27ae60;
      }
  }

  @keyframes loader {
      0%,
      100% {
          box-shadow: 25px 25px #3498db, -25px 25px #c0392b, -25px -25px #f1c40f, 25px -25px #27ae60;
      }
      25% {
          box-shadow: -25px 25px #3498db, -25px -25px #c0392b, 25px -25px #f1c40f, 25px 25px #27ae60;
      }
      50% {
          box-shadow: -25px -25px #3498db, 25px -25px #c0392b, 25px 25px #f1c40f, -25px 25px #27ae60;
      }
      75% {
          box-shadow: 25px -25px #3498db, 25px 25px #c0392b, -25px 25px #f1c40f, -25px -25px #27ae60;
      }
  }

  body {
      /*padding: 80px 0;*/
  }
  #CssLoader
  {
      
      text-align: center;
      height: 100%;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255,255,255 , 0.3);
      z-index: 9999;
  }
}`

const LoadingPad = () => {
  return (
    <LoadingPadContainer>
      <div id="CssLoader">
        <div className="spinftw">
        </div>
      </div>
    </LoadingPadContainer>
  )
}

export default LoadingPad;