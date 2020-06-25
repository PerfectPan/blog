import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import styled from "styled-components"

const Bar = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
`;

const Card = styled.div`
  flex: 1 0 0;
  border: none;
  text-align: center;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 2px;  
  line-height: 5em;
  margin-left: 5px;
  margin-right: 5px;
  box-shadow: 0 0.5em 1em -0.125em rgba(10,10,10,.1), 0 0 0 1px rgba(10,10,10,.02);

  background: ${props => props.background || "#f5f5f5"};
  color: ${props => props.color || "rgb(0, 0, 0)"};
  font-size: ${props => props.fontSize || "15px"};
  font-weight: ${props => props.fontWeight || "600"};
  border-radius: ${props => props.radius || "6px"};
  margin-top: ${props => props.marginTop};
  margin-bottom: ${props => props.marginBottom};
`;

class IndexPage extends React.Component {
  render() {
    const siteTitle = "Gatsby Starter Personal Website"

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title="Home"
          keywords={[`blog`, `gatsby`, `javascript`, `react`]}
        />
        <div align="center">
          <img style={{ margin: 0 }} src="./xm.jpg" alt="Gatsby Scene"/>
          <h1>
            是个什么都不会的废物.jpg
          </h1>
        </div>
        <Bar>
          <Card marginTop="35px">
            <Link
              style={{
                boxShadow: `none`,
                textDecoration: `none`,
                color: `inherit`,
              }}
              to={`/blog/`}
            >
              Blog
            </Link>
          </Card>
          <Card marginTop="35px">
            <a
              style={{
                boxShadow: `none`,
                textDecoration: `none`,
                color: `inherit`,
              }}
              target="blank"
              href="https://github.com/PerfectPan"
            >
              Project
            </a>
          </Card>
        </Bar>
      </Layout>
    )
  }
}

export default IndexPage
