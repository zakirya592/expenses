import React, { useState } from 'react';
import { Card, CardBody, Input, Button, Divider } from '@nextui-org/react';
import { FaUser, FaLock, FaStore, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- Add this
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigator = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    // console.log('success', success);
    const token= localStorage.getItem("token");
    //  const savedUser = localStorage.getItem("user");
    //  console.log('savedUser', savedUser);
    //   console.log('token', token);
     
    setLoading(false);
    if (success === true) {
      navigator("/expenses");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                <FaStore className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Expenses</h1>
            {/* <p className="text-gray-600">Point of Sales System</p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              startContent={<FaUser className="text-gray-400" />}
              variant="bordered"
              required
            />

            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<FaLock className="text-gray-400" />}
              endContent={
                <button
                  type="button"
                  tabIndex={-1}
                  className="focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              }
              variant="bordered"
              required
            />

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#87CEEB] to-purple-600 text-white font-semibold py-3"
              size="lg"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <Divider className="my-6" />

          {/* <div className="text-center text-sm text-gray-600">
            Demo credentials: admin / password
          </div> */}
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
