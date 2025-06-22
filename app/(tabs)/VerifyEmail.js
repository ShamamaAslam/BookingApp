import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './SupabaseClient';
export default function VerifyEmail() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    
    const checkVerification = async () => {
      try {
        // Initial immediate check
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user?.email_confirmed_at) {
          setIsVerified(true);
          router.replace('/(tabs)/Home');
          return;
        }

        // Set up interval for subsequent checks
        interval = setInterval(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user?.email_confirmed_at) {
            clearInterval(interval);
            setIsVerified(true);
            router.replace('/(tabs)/Home');
          }
        }, 2000);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkVerification();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const resendVerification = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) throw error;
      alert('Verification email resent!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Checking verification status...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={resendVerification}>
          <Text style={{ color: '#2E86C1' }}>Try resending verification email</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
        We've sent a verification link to {email}
      </Text>
      <Text style={{ marginBottom: 30, textAlign: 'center' }}>
        Please check your email and click the verification link to continue.
      </Text>
      
      <TouchableOpacity
        onPress={resendVerification}
        disabled={loading}
        style={{
          backgroundColor: '#2E86C1',
          padding: 15,
          borderRadius: 8,
          width: '100%',
          alignItems: 'center',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Resend Verification Email</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}



