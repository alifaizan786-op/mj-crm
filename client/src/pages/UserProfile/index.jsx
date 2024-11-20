import CommonLayout from '../../layouts/common';
import {useParams} from 'react-router-dom'


export default function UserProfile() {
    const {id} = useParams() 

    
  return (
    <CommonLayout>
      <div>
        <div>
          <h1>UserProfile</h1>
        </div>
      </div>
    </CommonLayout>
  );
}
