import React, { useState } from "react";
import styled from "styled-components";
import { Modal, Button, Form } from "react-bootstrap";
import { Row, Col } from "../Style/Wrapper";

const Filter = props => {
  const [stage3, setStage3] = useState(false);
  const [stage2, setStage2] = useState(false);
  const [stage1, setStage1] = useState(false);
  const [normal, setNormal] = useState(false);
  const [over, setOver] = useState(false);
  const [last, setLast] = useState(false);

  const filter = {
    stage3: stage3,
    stage2: stage2,
    stage1: stage1,
    normal: normal,
    over: over,
    last: last
  };

  const handleCancel = () => {
    setStage3(false);
    setStage2(false);
    setStage1(false);
    setNormal(false);
    setOver(false);
    setLast(false);
  };

  return (
    <Modal
      show={props.show}
      onHide={() => props.close(filter)}
      animation={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>絞り込み</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Wrapper>
          <Col>
            <Form.Check
              custom
              id="costom-checkbox-1"
              type="checkbox"
              label="3段階目"
              checked={stage3}
              onChange={() => setStage3(!stage3)}
            />
            <Form.Check
              custom
              id="costom-checkbox-2"
              type="checkbox"
              label="2段階目"
              checked={stage2}
              onChange={() => setStage2(!stage2)}
            />
            <Form.Check
              custom
              id="costom-checkbox-3"
              type="checkbox"
              label="1段階目"
              checked={stage1}
              onChange={() => setStage1(!stage1)}
            />
          </Col>
          <Col>
            <Form.Check
              custom
              id="costom-checkbox-4"
              type="checkbox"
              label="通常"
              checked={normal}
              onChange={() => setNormal(!normal)}
            />
            <Form.Check
              custom
              id="costom-checkbox-5"
              type="checkbox"
              label="持ち越し"
              checked={over}
              onChange={() => setOver(!over)}
            />
            <Form.Check
              custom
              id="costom-checkbox-6"
              type="checkbox"
              label="ラスアタ"
              checked={last}
              onChange={() => setLast(!last)}
            />
          </Col>
        </Wrapper>
        <ButtonWrapper>
          <Button variant="secondary" onClick={handleCancel}>
            全解除
          </Button>
        </ButtonWrapper>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => props.close(filter)}>決定</Button>
      </Modal.Footer>
    </Modal>
  );
};

const Wrapper = styled(Row)`
  justify-content: space-around;
`;

const ButtonWrapper = styled(Row)`
  width: 100%;
  margin-top: 20px;
  justify-content: center;
`;

export default Filter;
