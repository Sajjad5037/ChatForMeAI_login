const SignUpPage = () => {
    return (
      <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", textAlign: "center" }}>
        <h1>Welcome to Client Management System</h1>
        <p>
          Our innovative system empowers you to streamline your client interactions and daily operations effortlessly.
          Discover how our platform can transform your business with these key features:
        </p>
        <ul style={{ textAlign: "left", marginLeft: "20px" }}>
          <li> Secure, hassle-free management login</li>
          <li> Easy addition and removal of clients</li>
          <li> Real-time live dashboard for tracking waiting and inspection times</li>
          <li> Unique URL generation for personalized client dashboards</li>
          <li> Interactive notice board to keep everyone informed</li>
          <li> AI-powered chatbot to automate client interactions</li>
        </ul>
        
        <h3>Get Started Today!</h3>
        <p>
          Sign up now to save valuable time, boost productivity, and delight your clients with real-time updates and seamless communication. Watch the video below for an overview of how the Client Management System operates.
        </p>
        <iframe width="560" height="315" 
          src="https://www.youtube.com/embed/HZMLzdJDnZk" 
          frameborder="0" allowfullscreen>
        </iframe>
       
  
        <h3>Contact Us:</h3>
        <p>
          <i 
            className="fab fa-whatsapp" 
            style={{ color: "#25D366", fontSize: "24px", verticalAlign: "middle", marginRight: "8px" }}
          ></i>
          <strong>+92 300 4112884</strong>
        </p>
      </div>
    );
  };
  
  export default SignUpPage;
  