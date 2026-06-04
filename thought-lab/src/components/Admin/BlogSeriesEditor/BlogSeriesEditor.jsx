import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, List, Popconfirm } from 'antd';
import { createBlogSeries, getAllBlogSeries, updateBlogSeries, deleteBlogSeries } from '../../../http';

const BlogSeriesEditor = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [seriesList, setSeriesList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    const fetchAllSeries = async () => {
        setFetching(true);
        try {
            const res = await getAllBlogSeries();
            if (res.data && res.data.success) {
                setSeriesList(res.data.data);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to load existing series');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchAllSeries();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const data = {
                title: values.title,
                description: values.description
            };

            let response;
            if (editingId) {
                response = await updateBlogSeries(editingId, data);
            } else {
                response = await createBlogSeries(data);
            }

            if (response.data && response.data.success) {
                message.success(`Blog Series ${editingId ? 'updated' : 'created'} successfully!`);
                form.resetFields();
                setEditingId(null);
                fetchAllSeries();
            } else {
                message.error(response.data.message || 'Failed to save Blog Series');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'An error occurred while saving the series');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (series) => {
        setEditingId(series._id);
        form.setFieldsValue({
            title: series.title,
            description: series.description
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteBlogSeries(id);
            if (res.data && res.data.success) {
                message.success('Blog Series deleted successfully');
                fetchAllSeries();
            } else {
                message.error(res.data?.message || 'Failed to delete series');
            }
        } catch (error) {
            message.error('Error deleting series');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        form.resetFields();
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card title={editingId ? "Edit Blog Series" : "Create New Blog Series"} bordered={false}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Series Title"
                        name="title"
                        rules={[{ required: true, message: 'Please input the series title!' }]}
                    >
                        <Input placeholder="e.g., Celibacy, Philosophy" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea rows={4} placeholder="Brief description of the series..." />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#5d8093' }}>
                                {editingId ? 'Update Series' : 'Create Series'}
                            </Button>
                            {editingId && (
                                <Button onClick={cancelEdit}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Manage Existing Series" bordered={false}>
                <List
                    loading={fetching}
                    itemLayout="horizontal"
                    dataSource={seriesList}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button type="link" onClick={() => handleEdit(item)}>Edit</Button>,
                                <Popconfirm
                                    title="Delete the series"
                                    description="Are you sure you want to delete this series? Blogs in it will become standalone."
                                    onConfirm={() => handleDelete(item._id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="link" danger>Delete</Button>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={item.description || 'No description provided'}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default BlogSeriesEditor;
