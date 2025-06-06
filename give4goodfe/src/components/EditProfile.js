import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/SignUp.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const userEmail = sessionStorage.getItem('userEmail');

  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    if (!userEmail) {
      toast.error('Não está autenticado.');
      navigate('/announcementLogin');
      return;
    }

    fetch(`http://localhost:8080/users/email/${userEmail}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar dados');
        return res.json();
      })
      .then(data => {
        setUserId(data.id);
        setFormData({
          name: data.name || '',
          address: data.contact?.address || '',
          dateOfBirth: data.dateBirth || '',
          phoneNumber: data.contact?.phoneNumber?.toString() || '',
          email: data.contact?.email || ''
        });
      })
      .catch(err => {
        toast.error(`Erro: ${err.message}`);
      });
  }, [userEmail, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, address, dateOfBirth, phoneNumber, email } = formData;
    const formattedPhoneNumber = parseInt(phoneNumber, 10);

    if (!name.trim()) {
      toast.error('O nome é obrigatório.');
      return;
    }
    if (new Date(dateOfBirth) >= new Date()) {
      toast.error('Data de nascimento tem de ser no passado');
      return;
    }
    if (!/^\d{9}$/.test(phoneNumber)) {
      toast.error('Telefone tem de ter 9 dígitos');
      return;
    }
    if (isNaN(formattedPhoneNumber)) {
      toast.error('Telefone inválido');
      return;
    }
    if (!address.trim()) {
      toast.error('A morada é obrigatória.');
      return;
    }
    if (!email.trim()) {
      toast.error('O email é obrigatório.');
      return;
    }

    // Envia todos os campos editáveis (name, dateBirth, contact)
    const userUpdate = {
      name,
      dateBirth: dateOfBirth,
      contact: {
        address,
        phoneNumber: formattedPhoneNumber,
        email
      }
    };

    try {
      const response = await fetch(`http://localhost:8080/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userUpdate),
      });

      const responseText = await response.text();
      if (response.ok) {
        // Atualiza o sessionStorage se o email ou nome mudou
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userName', name);
        toast.success('Dados alterados com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.error(`Erro: ${responseText}`);
      }
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="title">Edit Profile</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label" htmlFor="name">Name</label>
            <input className="input" type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="address">Adress</label>
            <input className="input" type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="dateOfBirth">Date of Birth</label>
            <input className="input" type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="phoneNumber">Phone Number</label>
            <input className="input" type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <button className="button" type="submit">Save Changes</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditProfile;