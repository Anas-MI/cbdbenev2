import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../styles/app.scss";
import Link from "next/link";
import { Layout, Menu } from "antd";
import {
	// AppstoreOutlined,
	BarChartOutlined,
	CloudOutlined,
	ShopOutlined,
	TeamOutlined,
	UserOutlined,
	UploadOutlined,
	VideoCameraOutlined,
} from "@ant-design/icons";
import menu_items from "./menu-items";
const { Header, Content, Footer, Sider } = Layout;

import Sidebar from "./Sidebar";
export default function AdminLayout(props) {
	let menu = menu_items.map((elem, index) => {
		return (
			<Menu.Item key={index}>
				<Link href="/admin/home">
					<span className="nav-text">{elem.name}</span>
				</Link>
			</Menu.Item>
		);
	});
	return (
		<Layout>
			<Sider
				style={{
					overflow: "auto",
					height: "100vh",
					position: "fixed",
					left: 0,
				}}
			>
				<div className="logo" />
				<Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]}>
					{menu}
					<Menu.Item key="1">
						<UserOutlined />
						<span className="nav-text">nav 1</span>
					</Menu.Item>
					<Menu.Item key="2">
						<VideoCameraOutlined />
						<span className="nav-text">nav 2</span>
					</Menu.Item>
					<Menu.Item key="3">
						<UploadOutlined />
						<span className="nav-text">nav 3</span>
					</Menu.Item>
					<Menu.Item key="4">
						<BarChartOutlined />
						<span className="nav-text">nav 4</span>
					</Menu.Item>
					<Menu.Item key="5">
						<CloudOutlined />
						<span className="nav-text">nav 5</span>
					</Menu.Item>
					<Menu.Item key="6">
						<TeamOutlined />
						<span className="nav-text">nav 6</span>
					</Menu.Item>
					<Menu.Item key="7">
						<TeamOutlined />
						<span className="nav-text">nav 7</span>
					</Menu.Item>
					<Menu.Item key="8">
						<ShopOutlined />
						<span className="nav-text">nav 8</span>
					</Menu.Item>
				</Menu>
			</Sider>
			<Layout className="site-layout" style={{ marginLeft: 200 }}>
				<Header className="site-layout-background" style={{ padding: 0 }} />
				<Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
					<div
						className="site-layout-background"
						style={{ padding: 24, textAlign: "center" }}
					>
						{props.children}
					</div>
				</Content>
				<Footer style={{ textAlign: "center" }}>CBDBENE</Footer>
			</Layout>
		</Layout>
	);
}
