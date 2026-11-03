\# Dockie — Peer-to-Peer Printing Marketplace



A full-stack printing marketplace platform designed to connect students with local printing service providers, making document printing more accessible, convenient, and efficient.



\## About the Project



Dockie is a software product built around a peer-to-peer printing marketplace model.



The platform aims to simplify the printing process by connecting students who need documents printed with nearby printing service providers.



This repository contains the frontend application, backend API, database schema, API testing collection, branding assets, and business documentation developed for Dockie.



\## Core Modules



\- \*\*Student Module:\*\* Student registration, authentication, file uploads, and print order creation.

\- \*\*Printer Module:\*\* Printer profile management and availability status.

\- \*\*Admin Module:\*\* Administrative API routes.

\- \*\*Authentication:\*\* JWT-based authentication and password hashing.

\- \*\*Database:\*\* Relational database structure for marketplace operations.



\## Technology Stack



| Layer | Technologies |

|---|---|

| Frontend | HTML5, CSS3, JavaScript |

| Backend | Node.js, Express.js |

| Database | MySQL |

| Authentication | JWT, bcryptjs |

| Validation | Joi |

| Security | Helmet, CORS, Express Rate Limit |

| File Handling | Multer |

| API Testing | Postman |



\## Project Structure



```text

dockie-web/

│

├── Dockie/

│   ├── Branding/

│   ├── pitch/

│   ├── Software Web part/

│   ├── Business Analysis/

│   ├── Financial/

│   └── Valuation/

│

├── dockiee/

│   ├── assets/

│   ├── css/

│   ├── database/

│   │   └── schema.sql

│   ├── js/

│   ├── index.html

│   ├── about.html

│   ├── contact.html

│   ├── how-it-works.html

│   ├── login.html

│   ├── pricing.html

│   ├── printers.html

│   └── students.html

│

├── dockiee-backend/

│   ├── config/

│   ├── controllers/

│   ├── middlewares/

│   ├── routes/

│   ├── utils/

│   ├── server.js

│   ├── package.json

│   └── postman\_collection.json

│

├── .gitignore

└── README.md

```



\## Database Structure



The MySQL database schema includes the following tables:



1\. users

2\. student\_profiles

3\. printer\_profiles

4\. print\_files

5\. print\_orders

6\. payments

7\. ratings

8\. disputes

9\. admin\_logs



Database schema: `dockiee/database/schema.sql`



\## API Overview



Base URL (local development):



`http://localhost:5000`



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/auth/register` | Student registration |

| POST | `/api/auth/login` | User login |

| POST | `/api/student/upload` | File upload |

| POST | `/api/student/create-order` | Create print order |

| PATCH | `/api/printer/toggle-status` | Update printer status |



Additional routes are available in the backend source code.



\## Getting Started



\### Prerequisites



\- Node.js

\- npm

\- MySQL Server

\- Git



\### 1. Clone the repository



```bash

git clone https://github.com/YOUR\_USERNAME/dockie-web.git

cd dockie-web

```



\### 2. Set up the database



Create a MySQL database and import the schema:



```bash

mysql -u YOUR\_USERNAME -p YOUR\_DATABASE < dockiee/database/schema.sql

```



\### 3. Configure environment variables



Create a `.env` file inside `dockiee-backend/`.



Configure the database connection, authentication secret, and other required settings according to the backend configuration.



Never commit actual credentials or secret keys.



\### 4. Install backend dependencies



```bash

cd dockiee-backend

npm install

```



\### 5. Start the backend



Development mode:



```bash

npm run dev

```



Production mode:



```bash

npm start

```



The backend defaults to port `5000`, unless configured otherwise.



\### 6. Run the frontend



Open `dockiee/index.html` using a local development server.



Configure the frontend API base URL to match your running backend.



\## API Testing



A Postman collection is included:



`dockiee-backend/postman\_collection.json`



Import this collection into Postman and configure the `base\_url` variable before testing the API endpoints.



\## Business \& Product Documentation



The `Dockie/` directory contains supporting project materials, including:



\- Brand identity and logo assets

\- Social media branding materials

\- Investor pitch documentation

\- Business and competitor analysis

\- Marketing and branding plans

\- Financial and growth tracking

\- Business valuation documentation

\- Software project proposal and documentation



These materials document the product and business development journey behind Dockie.



\## Security



\- Environment files and credentials must remain private.

\- Dependencies such as `node\_modules` are excluded from version control.

\- Never publish production passwords, API keys, or database credentials.

\- Review publicly shared business documents before publication.



\## Project Status



This repository represents the development work and documentation of Dockie.



Individual features and integrations should be evaluated against the actual implementation before being considered production-ready.



\## Author



\*\*Md. Backtiar Abir\*\*



Full-Stack Developer | Founder \& Product Builder



GitHub: \[MY\_GITHUB\_PROFILE](https://github.com/backtiarabir)



\---



\*Building technology to make everyday services more accessible.\*

