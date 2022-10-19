<div id="top"></div>

<!-- HEADER -->
<div align="center">
  <a href="https://github.com/zeronerocode/ankasa-ticketing-server">
    <img src="https://camo.githubusercontent.com/6a3531baa42980849735e81a94023be676b1a62b5371fd1e3a4561bf9df13d19/68747470733a2f2f692e6962622e636f2f436e59535179382f696c6c757374726174696f6e2e706e67" alt="Logo" width="150px">
  </a>
  
  <h3 align="center">Angkasa Ticketing Backend</h3>

  <p align="center"> 
    Create a Node.js app for building Angkasa Ticketing RESTful APIs using Express.
  </p>
</div>

<!-- TABLE OF CONTENTS -->

## Table of Contents
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#project-built-with">Project Built With</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#requirements">Requirements</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#setup-env-example">Setup .env example</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#related-project">Related Project</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#our-team">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## Project Built With
This app was built with some technologies below:
- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [JSON Web Token](https://jwt.io/)
- [PostgreSQL](https://www.postgresql.org/)
- and other
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
This is an example of how to list things you need to use the software and how to install them.
* [Node.js](https://nodejs.org/en/download/)

### Requirements
* [Node.js](https://nodejs.org/en/)
* [Postman](https://www.getpostman.com/) for testing
* [Database](https://www.postgresql.org/)

### Installation
- Clone the Repo
```
git clone https://github.com/rifqiay/Angkasa-Ticketing-Backend.git
```
- Go To Folder Repo
```
cd Angkasa-Ticketing-Backend
```
- Install Module
```
npm install
```
- Make a new database
- <a href="#setup-env-example">Setup .env</a>
- Type ` npm run dev` To Start Development
- Type ` npm run start` To Start Production
<p align="right">(<a href="#top">back to top</a>)</p>

### Setup .env example
Create .env file in your root project folder.
```env
# main environment
PORT=8080

# postgres database environment
PGHOST=localhost
PGPORT=
PGDATABASE=
PGUSER=
PGPASSWORD=
DATABASE_URL=

# cors environment
FRONTEND_URL=http://example.com

# cloudinary environment
CLOUDINARY_URL=

# nodemailer environment
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=

# jwt environment
JWT_SECRET_KEY=
JWT_REFRESH_SECRET_KEY=
JWT_TOKEN_LIFE=30s
JWT_REFRESH_TOKEN_LIFE=5h
JWT_ALGORITHM=HS256

# encryption string environment
ENCRYPTION_PASSWORD=
ENCRYPTION_SALT=
ENCRYPTION_DIGEST=sha512

# common environment
SITE_NAME="Example App"
MAX_FILE_SIZE=2
COOKIE_SECRET_KEY=
EMAIL_SERVICE=

# nodemailer environment
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
```
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
<p align="right">(<a href="#top">back to top</a>)</p>

## Related Project
:rocket: [`Frontend Angkasa Ticketing`](https://github.com/rifqiay/Angkasa-Ticketing-Frontend)
<p align="right">(<a href="#top">back to top</a>)</p>

## Our Team
<center>
  <table>
    <tr>
      <th>Frontend/PM</th>
      <th>Frontend</th>
      <th>Frontend</th>
      <th>Backend</th>
      <th>Backend</th>
    </tr>
    <tr>
      <td align="center">
        <a href="https://github.com/rifqiay">
          <img width="150" style="background-size: contain;" src="" alt="Rifqi Ainul Yaqin"><br/>
          <b>Rifqi Ainul Yaqin</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/rifqiahmadpratama">
          <img width="150" src="" alt="Rifqi Ahmad Pratama"><br/>
          <b>Rifqi Ahmad Pratama</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/bagus25dzikri06">
          <img width="150" src="" alt="Bagus Dzikri Hidayat"><br/>
          <b>Bagus Dzikri Hidayat</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/chlasswg26">
          <img width="150" src="" alt="Ichlas Wardy Gustama"><br/>
          <b>Ichlas Wardy Gustama</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Hnaa17">
          <img width="150" src="https://avatars.githubusercontent.com/u/102232190?v=4" alt="Farhana Achmad "><br/>
          <b>Farhana Achmad </b>
        </a>
      </td>
    </tr>
  </table>
</center>
<p align="right">(<a href="#top">back to top</a>)</p>

## License
Distributed under the [MIT](/LICENSE) License.
<p align="right">(<a href="#top">back to top</a>)</p>