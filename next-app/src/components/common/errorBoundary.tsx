import React, { ComponentProps } from "react";

class ErrorBoundary extends React.Component {
  // constructor(props: any) {
  //   super(props);
  //   this.state = { hasError: false };
  // }
  // static getDerivedStateFromError(error) {
  //   return { hasError: true };
  // }
  // componentDidCatch(error: any, errorInfo: any) {
  //   console.log({ error, errorInfo });
  // }
  // render() {
  //   if (this.state.hasError) {
  //     return (
  //       <div>
  //         <h2>Found error!</h2>
  //         <button
  //           type="button"
  //           onClick={() => this.setState({ haseError: false })}
  //         >
  //           Try again?
  //         </button>
  //       </div>
  //     );
  //   }
  //   return this.props.children;
  // }
}

export default ErrorBoundary;
