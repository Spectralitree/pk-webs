import React, { useEffect, useState } from 'react';
import  * as BS from 'react-bootstrap'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from "react-hook-form";
import autosize from 'autosize';

import MemberCard from './MemberCard.js'
import Loading from "./Loading.js";
import API_URL from "../Constants/constants.js";

import { FaPlus } from "react-icons/fa";

export default function Memberlist(props) {
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;

    const [isLoading, setIsLoading ] = useState(false);
    const [isError, setIsError ] = useState(false);
    const [errorAlert, setErrorAlert ] = useState(false);

    const [proxyView, setProxyView] = useState(false);
    const [privacyView, setPrivacyView] = useState(false);

    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    const [members, setMembers ] = useState([]);
    const [newMember, setNewMember ] = useState('');
    const [value, setValue] = useState('');
    const [proxyTags, setProxyTags] = useState([{
      prefix: "", suffix: ""
    }]);

    const {register, handleSubmit} = useForm();

    useEffect(() => {
      fetchMembers();
    }, [userId, newMember])

    useEffect(() => {
      autosize(document.querySelector('textarea'));
  })

  function fetchMembers() {
    setIsLoading(true);
    setIsError(false);

     fetch(`${API_URL}s/${userId}/members`,{
    method: 'get',
    headers: {
      'Authorization': JSON.stringify(localStorage.getItem("token")).slice(1, -1)
    }}).then ( res => res.json()
    ).then (data => { 
      { newMember ? setMembers([...data, newMember]) : setMembers(data)}
      setIsLoading(false);
  })
    .catch (error => { 
        console.log(error);
        setIsError(true);
        setIsLoading(false);
    })
  }

    function addProxyField() {
      setProxyTags(oldTags => [...oldTags, {prefix: '', suffix: ''}] )
    }

    const submitMember = data => {
      setIsLoading(true);

      const newdata = data.proxy_tags ? {...data, proxy_tags: data.proxy_tags.filter(tag => !(tag.prefix === "" && tag.suffix === ""))} : data

      console.log(newdata);

      fetch(`${API_URL}m/`,{
        method: 'POST',
        body: JSON.stringify(newdata),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': JSON.stringify(localStorage.getItem("token")).slice(1, -1)
        }}).then (res => res.json()
        ).then (data => { 
            setNewMember(data); 
            setErrorAlert(false);
            closeModal();
    }
        ).catch (error => {
            console.error(error);
            setErrorAlert(true);
        });
    }

    const memberList = members.filter(member => {
        if (!value) return true;
        if (member.name.toLowerCase().includes(value.toLowerCase())) {
          return true;
        }
        return false;
      }).sort((a, b) => a.name.localeCompare(b.name)).map((member) => <BS.Card key={member.id}>
        <MemberCard
        member={member} 
        />
    </BS.Card>
    );

    return (
        <>
        { isLoading ? <Loading /> : isError ? 
        <BS.Alert variant="danger">Error fetching members.</BS.Alert> :
        <>
        <BS.Row noGutters="true" className="justify-content-md-center">
        <BS.Col xs={12} lg={4}>
        <BS.Form inline>
            <BS.Form.Control value={value} className="w-100" onChange={e => setValue(e.target.value)} placeholder="Search"/>
        </BS.Form>
        </BS.Col>
        <BS.Col xs={12} lg={2}>
          <BS.Button type="primary" className="ml-2" block onClick={() => fetchMembers()}>Refresh</BS.Button>
        </BS.Col>
        </BS.Row>
        <BS.Card className="mt-3 w-100">
          <BS.Card.Header className="d-flex align-items-center justify-content-between">
            <BS.Button variant="link" className="float-left" onClick={() => setOpen(o => !o)}><FaPlus className="mr-4"/>Add Member</BS.Button> 
            <Popup open={open} position="top-center" modal>
              <BS.Container>
                <BS.Card>
                  <BS.Card.Header>
                      <h5><FaPlus className="mr-3"/> Add member </h5>
                  </BS.Card.Header>
                  <BS.Card.Body>
                  { errorAlert ? <BS.Alert variant="danger">Something went wrong, please try logging in and out again.</BS.Alert> : "" }
                    <BS.Form onSubmit={handleSubmit(submitMember)}>
                            <BS.Form.Text>
                            </BS.Form.Text>
                            <BS.Form.Row>
                        <BS.Col className="mb-lg-2" xs={12} lg={3}>
                            <BS.Form.Label>Name:</BS.Form.Label>
                          <BS.Form.Control name="name" ref={register()} defaultValue={''} required/>
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={3}>
                            <BS.Form.Label>Display name: </BS.Form.Label>
                            <BS.Form.Control name="display_name" ref={register}  defaultValue={''} />
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={3}>
                            <BS.Form.Label>Birthday:</BS.Form.Label>
                            <BS.Form.Control  pattern="^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$" name="birthday" ref={register}  defaultValue={''}/>
                            <BS.Form.Text>(YYYY-MM-DD)</BS.Form.Text>
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={3}>
                            <BS.Form.Label>Pronouns:</BS.Form.Label>
                            <BS.Form.Control name="pronouns" ref={register} defaultValue={''} />
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={3}>
                            <BS.Form.Label>Avatar url:</BS.Form.Label> 
                          <BS.Form.Control type="url" name="avatar_url" ref={register}  defaultValue={''} />
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={3}>
                            <BS.Form.Label>Color:</BS.Form.Label> 
                          <BS.Form.Control  pattern="[A-Fa-f0-9]{6}" name="color" ref={register}  defaultValue={''} />
                            <BS.Form.Text>(hexcode)</BS.Form.Text>
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={2}>
                            <BS.Form.Label>Proxy tags:</BS.Form.Label> 
                            <BS.Button variant="primary" block onClick={() => setProxyView(view => !view)}> { proxyView ? "Hide" : "Show" }</BS.Button>
                        </BS.Col>
                        <BS.Col className="mb-lg-2" xs={12} lg={2}>
                            <BS.Form.Label>Privacy settings:</BS.Form.Label> 
                            <BS.Button variant="primary" block onClick={() => setPrivacyView(view => !view)}> { privacyView ? "Hide" : "Show" }</BS.Button>
                        </BS.Col>
                    </BS.Form.Row>
                    <hr/>
                    { proxyView ? <>
                <h5>Proxy Tags</h5>
                    <BS.Form.Row>
                  { proxyTags.map((item, index) => (
                    <BS.Col key={index} className="mb-lg-2" xs={12} lg={2}>
                        <BS.Form.Row>
                        <BS.InputGroup className="ml-1 mr-1 mb-1">
                        <BS.Form.Control name={`proxy_tags[${index}].prefix`} defaultValue={item.prefix} ref={register}/> 
                        <BS.Form.Control disabled placeholder='text'/>
                        <BS.Form.Control name={`proxy_tags[${index}].suffix`} defaultValue={item.suffix} ref={register}/>
                        </BS.InputGroup>
                        </BS.Form.Row>
                    </BS.Col>
                ))} <BS.Col className="mb-lg-2" xs={12} lg={2}><BS.Button block variant="light" onClick={() => addProxyField()}>Add new</BS.Button></BS.Col>
             </BS.Form.Row>
                    <hr/></> : "" }
                { privacyView ? <><h5>privacy settings</h5>
                    <BS.Form.Row>
                    <BS.Col className="mb-lg-2" xs={12} lg={3}>
                        <BS.Form.Label>Visibility:</BS.Form.Label>
                        <BS.Form.Control name="visibility" as="select" ref={register}>
                            <option>public</option>
                            <option>private</option>
                        </BS.Form.Control>
                    </BS.Col>
                    <BS.Col className="mb-lg-2" xs={12} lg={3}>
                    <BS.Form.Label>Name:</BS.Form.Label>
                        <BS.Form.Control name="name_privacy" as="select" ref={register}>
                            <option>public</option>
                            <option>private</option>
                        </BS.Form.Control>
                    </BS.Col>
                    <BS.Col className="mb-lg-2" xs={12} lg={3}>
                    <BS.Form.Label>Description:</BS.Form.Label>
                        <BS.Form.Control name="description_privacy" as="select" ref={register}>
                            <option>public</option>
                            <option>private</option>
                        </BS.Form.Control>
                    </BS.Col>
                    <BS.Col className="mb-lg-2" xs={12} lg={3}>
                    <BS.Form.Label>Birthday:</BS.Form.Label>
                        <BS.Form.Control name="birthday_privacy" as="select" ref={register}>
                            <option>public</option>
                            <option>private</option>
                        </BS.Form.Control>
                    </BS.Col>
                    <BS.Col className="mb-lg-2" xs={12} lg={3}>
                    <BS.Form.Label>Pronouns:</BS.Form.Label>
                        <BS.Form.Control name="pronoun_privacy" as="select" ref={register}>
                            <option>public</option>
                            <option>private</option>
                        </BS.Form.Control>
                    </BS.Col>
                    <BS.Col className="mb-3" xs={12} lg={3}>
                    <BS.Form.Label>Meta:</BS.Form.Label>
                        <BS.Form.Control name="metadata_privacy" as="select" ref={register}>
                            <option>public</option>
                            <option>private</option>
                        </BS.Form.Control>
                    </BS.Col>
                </BS.Form.Row>               
                <hr/></> : "" }
                <BS.Form.Group className="mt-3">
                        <BS.Form.Label>Description:</BS.Form.Label>
                        <BS.Form.Control maxLength="1000" as="textarea" rows="7" name="description" ref={register} defaultValue={''}/>
                    </BS.Form.Group>
                    <BS.Button variant="primary" type="submit">Submit</BS.Button> <BS.Button variant="light" className="float-right" onClick={closeModal}>Cancel</BS.Button>
                    </BS.Form>
                  </BS.Card.Body>
                </BS.Card>
              </BS.Container>
            </Popup>
          </BS.Card.Header>
        </BS.Card>
        <BS.Accordion className="mb-3 mt-3 w-100" defaultActiveKey="0">
            {memberList}
        </BS.Accordion>
        </>
        }
        </>
    )
}