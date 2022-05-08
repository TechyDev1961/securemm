import React from "react";
import './index.css'
function openMenu() {
  document.querySelector(".mobile-dropdown").classList.toggle("open")
}
function closeMenu() {
  document.querySelector(".mobile-dropdown").classList.remove("open")
}
export function LandingPage() {
  return (
    <div>
      {/* 
 */}
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {/* Project SecureMM Title */}
      <title>SecureMM</title>
      {/* Linking Favicon */}
      <link rel="shortcut icon" href="./assets/img/securemm.png" type="image/x-icon" />
      {/* Linking CSS Stylesheet */}
      {/* Linking Font Awesome */}
      <section className="main">
        <div className="topbar" id="homepage">
          <div className="brand-text-logo-box">
            <img src="https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png" alt="secureMM" className="securemm-logo" />
            <h1 className="brand-name-text">SecureMM</h1>
          </div>
          <ul className="pc-nav">
            <li><a href="#homepage">Home</a></li>
            <li><a href="#aboutpage">About</a></li>
            <li><a href="#benefitspage">Benefits</a></li>
            <li><a href="#faqpage">FAQs</a></li>
            <li><a href="#contactpage">Contact</a></li>
          </ul>
          <div className="mobile-menu" onClick={openMenu}>
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
            <div className="mobile-dropdown">
              <ul>
                <li><a href="#homepage">Home</a></li>
                <li><a href="#aboutpage">About</a></li>
                <li><a href="#benefitspage">Benefits</a></li>
                <li><a href="#faqpage">FAQs</a></li>
                <li><a href="#contactpage">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <h1 className="main-home-text">SecureMM</h1>
        <h2 className="sub-home-text">Secure · Trusted · Safe</h2>
        <div className="home-btn-box">
          <a href="/requestmm"><i className="fa-solid fa-user-lock" />&nbsp;Request MM</a>
          <a href="#benefitspage"><i className="fa-solid fa-arrow-right-long" />&nbsp;Explore More</a>
        </div>
        <div className="read-more-down">
          <a href="#aboutpage"><i className="fa-solid fa-caret-down fa-2x" /></a>
        </div>
        <div className="about">
          <h1 className="main-about-text">About SecureMM <i className="fa-solid fa-lock" /></h1>
          <p className="sub-about-text" id="aboutpage">This organization is a way to keep your deals safe and your money guaranteed. We’re scammer alert staff seeking your needs, we chose to make this happen to help the community. <br /> <br /> We have high experience to make sure you have the best experience with us. <br /> <br /> We dedicated our time &amp; money to help grow this community, we’re looking for your own safety while dealing with strangers. Our main goal is always to keep a good connection between our clients. We are originally just normal scammer alert staff looking forwards to help through out your deal. This project is founded by Crownshot and managed by Icey.</p>
          <div className="about-row" id="benefitspage">
            <div className="feature">
              <i className="fa-solid fa-lock fa-3x" />
              <h1>Secure</h1>
              <p>SecureMM Ensures your deal is 100% Secure and your chances of getting scammed are reduced to 0.</p>
            </div>
            <div className="feature">
              <i className="fa-solid fa-shield-halved fa-3x" />
              <h1>Trusted</h1>
              <p>We’re always trying to add more to our reputation, so that we make sure you feel safe and comfortable while using our service. </p>
            </div>
            <div className="feature">
              <i className="fa-solid fa-clock fa-3x" />
              <h1>Quick</h1>
              <p>Our purpose is to make things quick, we are always available our Middleman do their best to be available at all times. </p>
            </div>
          </div>
        </div>
        <div className="faq" id="faqpage">
          <h1 className="main-faq-header">Frequently Asked Questions <i className="fa-solid fa-circle-question" /></h1>
          <div className="faq-box">
            <div className="faq-question">
              <h1>What is a Middleman?</h1>
              <p>A middleman is when you use a trustworthy person to hold one part of a deal to facilitate interaction between parties in order to prevent the buyer and seller from getting scammed.</p>
            </div>
            <div className="faq-question">
              <h1>How does this work?</h1>
              <p>In our homepage, there is a option to request a MM once you click the button select the exchange you'd like to request a MM for if not a exchange select what in game items are being transferred and click continue, then within 5 minutes at most a MM will be with you.</p>
            </div>
            <div className="faq-question">
              <h1>What are the fees?</h1>
              <p>We currently don't have a fee, we are working on increasing our reputation and becoming a better MM server.</p>
            </div>
            <div className="faq-question">
              <h1>How do I report Scammers?</h1>
              <p>If it's a attempted scam, or any sort of scam really please don't hesitate to head to discord.gg/ScammerAlert and make a report.</p>
            </div>
            <div className="faq-question">
              <h1>How can I know you won't Scam me?</h1>
              <p>Feel free to check our vouches to see the past deals that our MM have done</p>
            </div>
          </div>
        </div>
        <div className="contact" id="contactpage">
          <h1 className="main-contact-header">Contact Us&nbsp;<i className="fa-solid fa-envelope" /></h1>
          <div className="contact-box">
            <form>
              <input type="text" placeholder="Name" className="name-input" required />
              <input type="email" placeholder="Email ID" className="email-input" required />
              <input type="text" placeholder="Discord#Tag" className="discord-input" required />
              <input type="text" placeholder="Subject" className="subject-input" required />
              <textarea className="message-input" placeholder="Your Message" cols={35} rows={8} defaultValue={""} />
              <button onclick="sendemail()" className="submitBtn">Submit&nbsp;<i className="fa-solid fa-paper-plane" /></button>
            </form>
          </div>
        </div>
        <button className="discord-Btn"><i className="fa-brands fa-discord fa-2x" /></button>
      </section>
      <footer>
        <div className="top-row">
          <h1> ©  SecureMM Team &amp; Co | All Rights Reserved</h1>
          <div className="social-row-box">
            <a href="#"><i className="fa-brands fa-github fa-xl" /></a>
            <a href="#"><i className="fa-brands fa-discord fa-xl" /></a>
            <a href="#"><i className="fa-brands fa-twitter fa-xl" /></a>
            <a href="#"><i className="fa-brands fa-instagram fa-xl" /></a>
          </div>
        </div>
        <div className="footer-row">
          <div className="row-box">
            <h1>Terms and Conditions</h1>
            <a href="#">Tos &amp; Docs</a>
          </div>
          <div className="row-box">
            <h1>Support</h1>
            <a href="https://discord.gg/tCKR8kqZxv">Community</a>
          </div>
          <div className="row-box">
            <h1>Join Us</h1>
            <a href="#">Apply</a>
          </div>
          <div className="row-box">
            <h1>Contributors</h1>
            <a href="https://discord.com/users/593397331768901652">Crownshot</a>
            <a href="https://discord.com/users/940303888962179164">Icey</a>
          </div>
          <div className="row-box">
            <h1>Servers</h1>
            <a href="https://discord.gg/gsVYDe5MQG">Scammer Alert</a>
            <a href="https://discord.gg/tCKR8kqZxv">SecureMM</a>
          </div>
          <div className="row-box">
            <h1>Developers</h1>
            <a href="https://github.com/TechyDev1961">TechyDev1961</a>
            <a href="https://github.com/AndrewDisco">Andrew</a>
            <a href="https://github.com/shahzain345">Shahzain</a>
          </div>
        </div>
      </footer>
    </div>
  )
}