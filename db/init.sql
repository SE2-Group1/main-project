--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

-- Started on 2024-11-05 09:27:01

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16470)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5871 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 17598)
-- Name: area_doc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.area_doc (
    area integer NOT NULL,
    doc integer NOT NULL
);


ALTER TABLE public.area_doc OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17596)
-- Name: area_doc_area_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.area_doc_area_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.area_doc_area_seq OWNER TO postgres;

--
-- TOC entry 5873 (class 0 OID 0)
-- Dependencies: 236
-- Name: area_doc_area_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.area_doc_area_seq OWNED BY public.area_doc.area;


--
-- TOC entry 237 (class 1259 OID 17597)
-- Name: area_doc_doc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.area_doc_doc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.area_doc_doc_seq OWNER TO postgres;

--
-- TOC entry 5874 (class 0 OID 0)
-- Dependencies: 237
-- Name: area_doc_doc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.area_doc_doc_seq OWNED BY public.area_doc.doc;


--
-- TOC entry 235 (class 1259 OID 17587)
-- Name: areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas (
    id_area integer NOT NULL,
    area public.geometry(Geometry,4326)
);


ALTER TABLE public.areas OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17586)
-- Name: areas_id_area_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.areas_id_area_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.areas_id_area_seq OWNER TO postgres;

--
-- TOC entry 5876 (class 0 OID 0)
-- Dependencies: 234
-- Name: areas_id_area_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.areas_id_area_seq OWNED BY public.areas.id_area;


--
-- TOC entry 222 (class 1259 OID 16414)
-- Name: doc_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doc_type (
    type_name character varying(50) NOT NULL
);


ALTER TABLE public.doc_type OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16408)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id_file integer NOT NULL,
    title character varying(255) NOT NULL,
    "desc" character varying(1000) NOT NULL,
    scale character varying(100) NOT NULL,
    issuance_date date NOT NULL,
    type character varying(100) NOT NULL,
    language character varying(50),
    "link " character varying(100),
    pages character varying(50)
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16407)
-- Name: documents_id_file_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_id_file_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_file_seq OWNER TO postgres;

--
-- TOC entry 5879 (class 0 OID 0)
-- Dependencies: 220
-- Name: documents_id_file_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_id_file_seq OWNED BY public.documents.id_file;


--
-- TOC entry 239 (class 1259 OID 25808)
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.languages (
    language_id character varying(50) NOT NULL,
    language_name character(50) NOT NULL
);


ALTER TABLE public.languages OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16453)
-- Name: link; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.link (
    doc1 integer NOT NULL,
    doc2 integer NOT NULL,
    link_type character varying(50) NOT NULL
);


ALTER TABLE public.link OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16451)
-- Name: link_doc1_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.link_doc1_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.link_doc1_seq OWNER TO postgres;

--
-- TOC entry 5883 (class 0 OID 0)
-- Dependencies: 226
-- Name: link_doc1_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.link_doc1_seq OWNED BY public.link.doc1;


--
-- TOC entry 227 (class 1259 OID 16452)
-- Name: link_doc2_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.link_doc2_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.link_doc2_seq OWNER TO postgres;

--
-- TOC entry 5884 (class 0 OID 0)
-- Dependencies: 227
-- Name: link_doc2_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.link_doc2_seq OWNED BY public.link.doc2;


--
-- TOC entry 241 (class 1259 OID 26024)
-- Name: link_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.link_types (
    link_name character varying(50) NOT NULL
);


ALTER TABLE public.link_types OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16392)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_name character varying(50) NOT NULL,
    description character varying(100) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 25813)
-- Name: scales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scales (
    scale character varying(100) NOT NULL
);


ALTER TABLE public.scales OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16424)
-- Name: stakeholders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stakeholders (
    stakeholder character varying(100) NOT NULL
);


ALTER TABLE public.stakeholders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16435)
-- Name: stakeholders_docs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stakeholders_docs (
    stakeholder "char" NOT NULL,
    doc integer NOT NULL
);


ALTER TABLE public.stakeholders_docs OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16434)
-- Name: stakeholders_docs_doc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stakeholders_docs_doc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stakeholders_docs_doc_seq OWNER TO postgres;

--
-- TOC entry 5889 (class 0 OID 0)
-- Dependencies: 224
-- Name: stakeholders_docs_doc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stakeholders_docs_doc_seq OWNED BY public.stakeholders_docs.doc;


--
-- TOC entry 218 (class 1259 OID 16385)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    username character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    password bytea NOT NULL,
    salt bytea NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5657 (class 2604 OID 17601)
-- Name: area_doc area; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area_doc ALTER COLUMN area SET DEFAULT nextval('public.area_doc_area_seq'::regclass);


--
-- TOC entry 5658 (class 2604 OID 17602)
-- Name: area_doc doc; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area_doc ALTER COLUMN doc SET DEFAULT nextval('public.area_doc_doc_seq'::regclass);


--
-- TOC entry 5656 (class 2604 OID 17590)
-- Name: areas id_area; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas ALTER COLUMN id_area SET DEFAULT nextval('public.areas_id_area_seq'::regclass);


--
-- TOC entry 5653 (class 2604 OID 16411)
-- Name: documents id_file; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN id_file SET DEFAULT nextval('public.documents_id_file_seq'::regclass);


--
-- TOC entry 5654 (class 2604 OID 16456)
-- Name: link doc1; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link ALTER COLUMN doc1 SET DEFAULT nextval('public.link_doc1_seq'::regclass);


--
-- TOC entry 5655 (class 2604 OID 16457)
-- Name: link doc2; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link ALTER COLUMN doc2 SET DEFAULT nextval('public.link_doc2_seq'::regclass);


--
-- TOC entry 5862 (class 0 OID 17598)
-- Dependencies: 238
-- Data for Name: area_doc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.area_doc (area, doc) FROM stdin;
\.


--
-- TOC entry 5859 (class 0 OID 17587)
-- Dependencies: 235
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas (id_area, area) FROM stdin;
\.


--
-- TOC entry 5851 (class 0 OID 16414)
-- Dependencies: 222
-- Data for Name: doc_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doc_type (type_name) FROM stdin;
Design
Informative
Prescriptive
Technical
Agreement
Conflict
Consultation
Material effects
\.


--
-- TOC entry 5850 (class 0 OID 16408)
-- Dependencies: 221
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id_file, title, "desc", scale, issuance_date, type, language, "link ", pages) FROM stdin;
\.


--
-- TOC entry 5863 (class 0 OID 25808)
-- Dependencies: 239
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.languages (language_id, language_name) FROM stdin;
IT	Italian                                           
ENG	English                                           
SV	Swedish                                           
FI	Finnish                                           
SE	Northern Sámi                                     
\.


--
-- TOC entry 5857 (class 0 OID 16453)
-- Dependencies: 228
-- Data for Name: link; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.link (doc1, doc2, link_type) FROM stdin;
\.


--
-- TOC entry 5865 (class 0 OID 26024)
-- Dependencies: 241
-- Data for Name: link_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.link_types (link_name) FROM stdin;
direct consequence
collateral consequence
projection
update
\.


--
-- TOC entry 5848 (class 0 OID 16392)
-- Dependencies: 219
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_name, description) FROM stdin;
Admin	GRANT ALL ACCESS
Urban Planner	GRANT ACCESS FOR MANAGING DOCUMENTS AND AREAS
Citizen	ACCESS TO VIEW MAP AND DOCS
\.


--
-- TOC entry 5864 (class 0 OID 25813)
-- Dependencies: 240
-- Data for Name: scales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scales (scale) FROM stdin;
1:100000
1:10000
1:5000
1:1000
\.


--
-- TOC entry 5652 (class 0 OID 16792)
-- Dependencies: 230
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 5852 (class 0 OID 16424)
-- Dependencies: 223
-- Data for Name: stakeholders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stakeholders (stakeholder) FROM stdin;
LKAB
Municipality
Regional authority
Architecture firms
Citizens
Others
\.


--
-- TOC entry 5854 (class 0 OID 16435)
-- Dependencies: 225
-- Data for Name: stakeholders_docs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stakeholders_docs (stakeholder, doc) FROM stdin;
\.


--
-- TOC entry 5847 (class 0 OID 16385)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (username, role, password, salt) FROM stdin;
\.


--
-- TOC entry 5891 (class 0 OID 0)
-- Dependencies: 236
-- Name: area_doc_area_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.area_doc_area_seq', 1, false);


--
-- TOC entry 5892 (class 0 OID 0)
-- Dependencies: 237
-- Name: area_doc_doc_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.area_doc_doc_seq', 1, false);


--
-- TOC entry 5893 (class 0 OID 0)
-- Dependencies: 234
-- Name: areas_id_area_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.areas_id_area_seq', 1, false);


--
-- TOC entry 5894 (class 0 OID 0)
-- Dependencies: 220
-- Name: documents_id_file_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_file_seq', 1, false);


--
-- TOC entry 5895 (class 0 OID 0)
-- Dependencies: 226
-- Name: link_doc1_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.link_doc1_seq', 1, false);


--
-- TOC entry 5896 (class 0 OID 0)
-- Dependencies: 227
-- Name: link_doc2_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.link_doc2_seq', 1, false);


--
-- TOC entry 5897 (class 0 OID 0)
-- Dependencies: 224
-- Name: stakeholders_docs_doc_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stakeholders_docs_doc_seq', 1, false);


--
-- TOC entry 5679 (class 2606 OID 17604)
-- Name: area_doc area_doc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area_doc
    ADD CONSTRAINT area_doc_pkey PRIMARY KEY (area, doc);


--
-- TOC entry 5677 (class 2606 OID 17594)
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id_area);


--
-- TOC entry 5667 (class 2606 OID 25839)
-- Name: doc_type doc_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doc_type
    ADD CONSTRAINT doc_type_pkey PRIMARY KEY (type_name);


--
-- TOC entry 5665 (class 2606 OID 16413)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id_file);


--
-- TOC entry 5681 (class 2606 OID 25866)
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (language_id);


--
-- TOC entry 5673 (class 2606 OID 25881)
-- Name: link link_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_pkey PRIMARY KEY (doc1, doc2, link_type);


--
-- TOC entry 5685 (class 2606 OID 26028)
-- Name: link_types link_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_types
    ADD CONSTRAINT link_types_pkey PRIMARY KEY (link_name);


--
-- TOC entry 5663 (class 2606 OID 25887)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_name);


--
-- TOC entry 5683 (class 2606 OID 25902)
-- Name: scales scales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scales
    ADD CONSTRAINT scales_pkey PRIMARY KEY (scale);


--
-- TOC entry 5671 (class 2606 OID 16450)
-- Name: stakeholders_docs stakeholders_docs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders_docs
    ADD CONSTRAINT stakeholders_docs_pkey PRIMARY KEY (stakeholder, doc);


--
-- TOC entry 5669 (class 2606 OID 25913)
-- Name: stakeholders stakeholders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders
    ADD CONSTRAINT stakeholders_pkey PRIMARY KEY (stakeholder);


--
-- TOC entry 5661 (class 2606 OID 25943)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- TOC entry 5695 (class 2606 OID 17605)
-- Name: area_doc area; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area_doc
    ADD CONSTRAINT area FOREIGN KEY (area) REFERENCES public.areas(id_area) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5690 (class 2606 OID 16444)
-- Name: stakeholders_docs doc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders_docs
    ADD CONSTRAINT doc FOREIGN KEY (doc) REFERENCES public.documents(id_file) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5696 (class 2606 OID 17610)
-- Name: area_doc doc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area_doc
    ADD CONSTRAINT doc FOREIGN KEY (doc) REFERENCES public.documents(id_file) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5692 (class 2606 OID 16460)
-- Name: link doc1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT doc1 FOREIGN KEY (doc1) REFERENCES public.documents(id_file) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5693 (class 2606 OID 16465)
-- Name: link doc2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT doc2 FOREIGN KEY (doc2) REFERENCES public.documents(id_file) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5687 (class 2606 OID 25991)
-- Name: documents documents_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_type_fkey FOREIGN KEY (type) REFERENCES public.doc_type(type_name) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- TOC entry 5688 (class 2606 OID 26007)
-- Name: documents language; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT language FOREIGN KEY (language) REFERENCES public.languages(language_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- TOC entry 5694 (class 2606 OID 26029)
-- Name: link link_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link
    ADD CONSTRAINT link_type FOREIGN KEY (link_type) REFERENCES public.link_types(link_name) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- TOC entry 5689 (class 2606 OID 25980)
-- Name: documents scale; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT scale FOREIGN KEY (scale) REFERENCES public.scales(scale) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- TOC entry 5691 (class 2606 OID 25914)
-- Name: stakeholders_docs stakeholder; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders_docs
    ADD CONSTRAINT stakeholder FOREIGN KEY (stakeholder) REFERENCES public.stakeholders(stakeholder) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5686 (class 2606 OID 25950)
-- Name: users users_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_fkey FOREIGN KEY (role) REFERENCES public.roles(role_name) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- TOC entry 5872 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE area_doc; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.area_doc TO admin;


--
-- TOC entry 5875 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE areas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.areas TO admin;


--
-- TOC entry 5877 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE doc_type; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.doc_type TO admin;


--
-- TOC entry 5878 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.documents TO admin;


--
-- TOC entry 5880 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE geography_columns; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.geography_columns TO admin;


--
-- TOC entry 5881 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE geometry_columns; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.geometry_columns TO admin;


--
-- TOC entry 5882 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE link; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.link TO admin;


--
-- TOC entry 5885 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO admin;


--
-- TOC entry 5886 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE spatial_ref_sys; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.spatial_ref_sys TO admin;


--
-- TOC entry 5887 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE stakeholders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stakeholders TO admin;


--
-- TOC entry 5888 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE stakeholders_docs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stakeholders_docs TO admin;


--
-- TOC entry 5890 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO admin;


-- Completed on 2024-11-05 09:27:02

--
-- PostgreSQL database dump complete
--

